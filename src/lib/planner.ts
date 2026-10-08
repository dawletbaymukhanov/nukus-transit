import type { Journey, LatLng, RideLeg, Route, Stop, WalkLeg } from "@/types/transit";
import { walkDistanceM, walkMinutes } from "./geo";

export interface PlanOptions {
  /** Bekatgacha / bekatdan piyoda eng uzoq masofa (metr) */
  maxWalkM?: number;
  maxResults?: number;
  /** Almashishning "narxi" (metr bilan): ko'proq bo'lsa, almashishsiz variant afzal */
  transferPenaltyM?: number;
  /** Har bir bekat uchun "narx" (metr bilan) */
  stopPenaltyM?: number;
  /** Eng qulay variantdan shuncha metr ko'p piyoda yuriladigan variantlar ko'rsatilmaydi */
  walkSlackM?: number;
}

const DEFAULTS: Required<PlanOptions> = {
  maxWalkM: 1200,
  maxResults: 3,
  transferPenaltyM: 500,
  stopPenaltyM: 40,
  walkSlackM: 600,
};

/** Marshrutning bitta yo'nalishi: bekatlar ketma-ketligi */
interface Direction {
  route: Route;
  stops: Stop[];
}

function buildDirections(routes: Route[], stopsById: Map<string, Stop>): Direction[] {
  const out: Direction[] = [];
  for (const route of routes) {
    const seq = route.stopIds
      .map((id) => stopsById.get(id))
      .filter((s): s is Stop => Boolean(s));
    if (seq.length < 2) continue;
    out.push({ route, stops: seq });
    if (route.bidirectional) out.push({ route, stops: [...seq].reverse() });
  }
  return out;
}

function walkLeg(from: LatLng, to: LatLng): WalkLeg {
  const distanceM = walkDistanceM(from, to);
  return {
    from,
    to,
    distanceM,
    durationMin: walkMinutes(distanceM),
    geometry: [from, to],
  };
}

function rideLeg(d: Direction, i: number, j: number): RideLeg {
  const path = d.stops.slice(i, j + 1);
  return {
    route: d.route,
    boardStop: path[0],
    alightStop: path[path.length - 1],
    stopsCount: j - i,
    path,
  };
}

/** Berilgan nuqtadan `maxM` metr ichidagi bekatlar: id -> piyoda masofa */
function stopsNear(point: LatLng, stops: Stop[], maxM: number): Map<string, number> {
  const near = new Map<string, number>();
  for (const s of stops) {
    const d = walkDistanceM(point, s);
    if (d <= maxM) near.set(s.id, d);
  }
  return near;
}

/** Eng yaqin bekatlar (natija topilmaganda foydalanuvchiga ko'rsatish uchun) */
export function nearestStops(
  point: LatLng,
  stops: Stop[],
  count = 3,
): { stop: Stop; distanceM: number }[] {
  return stops
    .map((stop) => ({ stop, distanceM: walkDistanceM(point, stop) }))
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, count);
}

interface Candidate {
  cost: number;
  rides: RideLeg[];
  walkIn: number;
  walkOut: number;
}

/**
 * A nuqtadan B nuqtaga borish variantlarini topadi:
 * to'g'ridan-to'g'ri yoki 1 marta almashish bilan.
 * Eng yaxshi variant birinchi turadi.
 */
export function planJourneys(
  from: LatLng,
  to: LatLng,
  routes: Route[],
  stops: Stop[],
  options: PlanOptions = {},
): Journey[] {
  const opt = { ...DEFAULTS, ...options };
  const stopsById = new Map(stops.map((s) => [s.id, s]));
  const dirs = buildDirections(routes, stopsById);
  const nearFrom = stopsNear(from, stops, opt.maxWalkM);
  const nearTo = stopsNear(to, stops, opt.maxWalkM);
  if (nearFrom.size === 0 || nearTo.size === 0) return [];

  // Har bir yo'nalish uchun: minish mumkin bo'lgan va tushish mumkin bo'lgan joylar
  const info = dirs.map((d) => ({
    d,
    boards: d.stops.flatMap((s, i) => (nearFrom.has(s.id) ? [i] : [])),
    alights: d.stops.flatMap((s, j) => (nearTo.has(s.id) ? [j] : [])),
    index: (() => {
      const m = new Map<string, number[]>();
      d.stops.forEach((s, i) => m.set(s.id, [...(m.get(s.id) ?? []), i]));
      return m;
    })(),
  }));

  const best = new Map<string, Candidate>();
  const offer = (key: string, c: Candidate) => {
    const prev = best.get(key);
    if (!prev || c.cost < prev.cost) best.set(key, c);
  };

  // 1) To'g'ridan-to'g'ri
  for (const a of info) {
    for (const i of a.boards) {
      for (const j of a.alights) {
        if (j <= i) continue;
        const walkIn = nearFrom.get(a.d.stops[i].id)!;
        const walkOut = nearTo.get(a.d.stops[j].id)!;
        offer(a.d.route.id, {
          cost: walkIn + walkOut + (j - i) * opt.stopPenaltyM,
          rides: [rideLeg(a.d, i, j)],
          walkIn,
          walkOut,
        });
      }
    }
  }

  // 2) Bir marta almashish (bir xil bekatda)
  for (const a of info) {
    if (a.boards.length === 0) continue;
    for (const b of info) {
      if (a.d.route.id === b.d.route.id || b.alights.length === 0) continue;
      for (const i of a.boards) {
        for (let k = i + 1; k < a.d.stops.length; k++) {
          const transferIdx = b.index.get(a.d.stops[k].id);
          if (!transferIdx) continue;
          for (const bi of transferIdx) {
            for (const j of b.alights) {
              if (j <= bi) continue;
              const walkIn = nearFrom.get(a.d.stops[i].id)!;
              const walkOut = nearTo.get(b.d.stops[j].id)!;
              offer(`${a.d.route.id}>${b.d.route.id}`, {
                cost:
                  walkIn +
                  walkOut +
                  (k - i + (j - bi)) * opt.stopPenaltyM +
                  opt.transferPenaltyM,
                rides: [rideLeg(a.d, i, k), rideLeg(b.d, bi, j)],
                walkIn,
                walkOut,
              });
            }
          }
        }
      }
    }
  }

  // Eng kam piyoda yuradigan variantdan ancha ko'p yuriladigan variantlarni tashlaymiz
  const minWalk = Math.min(...[...best.values()].map((c) => c.walkIn + c.walkOut));

  return [...best.entries()]
    .filter(([, c]) => c.walkIn + c.walkOut <= minWalk + opt.walkSlackM)
    .sort((x, y) => x[1].cost - y[1].cost)
    .slice(0, opt.maxResults)
    .map(([key, c]) => {
      const walkToBoard = walkLeg(from, c.rides[0].boardStop);
      const walkToDestination = walkLeg(c.rides[c.rides.length - 1].alightStop, to);
      return {
        id: key,
        walkToBoard,
        rides: c.rides,
        walkToDestination,
        totalWalkM: walkToBoard.distanceM + walkToDestination.distanceM,
        transfers: c.rides.length - 1,
      };
    });
}
