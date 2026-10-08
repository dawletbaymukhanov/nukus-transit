import type { Journey, Route } from "@/types/transit";
import { formatDistance } from "@/lib/geo";

const typeName = (r: Route) => (r.type === "bus" ? "Avtobus" : "Marshrutka");

function Badge({ route }: { route: Route }) {
  return (
    <span
      className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-bold text-white"
      style={{ background: route.color ?? "#0d9488" }}
    >
      {route.number}
    </span>
  );
}

function WalkIcon({ n }: { n: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-white">
      {n}
    </span>
  );
}

interface Props {
  journeys: Journey[];
  selected: number;
  onSelect: (i: number) => void;
}

export default function JourneyPanel({ journeys, selected, onSelect }: Props) {
  const j = journeys[selected] ?? journeys[0];
  if (!j) return null;

  const rideMin = (ride: Journey["rides"][number]) => ride.stopsCount;

  return (
    <div className="space-y-3 p-3">
      {/* Variantlar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {journeys.map((x, i) => (
          <button
            key={x.id}
            onClick={() => onSelect(i)}
            aria-pressed={i === selected}
            className={`shrink-0 rounded-xl border px-3 py-2 text-left text-xs ${
              i === selected ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white"
            }`}
          >
            <span className="flex items-center gap-1">
              {x.rides.map((r, k) => (
                <span key={r.route.id} className="flex items-center gap-1">
                  {k > 0 && <span className="text-slate-400">→</span>}
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-bold text-white"
                    style={{ background: r.route.color ?? "#0d9488" }}
                  >
                    {r.route.number}
                  </span>
                </span>
              ))}
            </span>
            <span className="mt-1 block text-slate-500">
              {x.transfers === 0 ? "almashishsiz" : "1 marta almashish"} · piyoda{" "}
              {formatDistance(x.totalWalkM)}
            </span>
          </button>
        ))}
      </div>

      {/* Qadamlar */}
      <ol className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-3">
        <li className="flex gap-3 py-3">
          <WalkIcon n={1} />
          <div className="min-w-0 text-sm">
            <p className="font-semibold">Piyoda: {j.rides[0].boardStop.name} bekatigacha</p>
            <p className="text-xs text-slate-500">
              {formatDistance(j.walkToBoard.distanceM)} · taxminan {j.walkToBoard.durationMin} daqiqa
            </p>
          </div>
        </li>

        {j.rides.map((ride, i) => (
          <li key={ride.route.id + i} className="flex gap-3 py-3">
            <Badge route={ride.route} />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                {typeName(ride.route)} {ride.route.number}
                {i > 0 && <span className="font-normal text-slate-500"> (almashish)</span>}
              </p>
              <p className="text-slate-700">
                Minish: <b>{ride.boardStop.name}</b>
              </p>
              <p className="text-slate-700">
                Tushish: <b>{ride.alightStop.name}</b>
              </p>
              <p className="text-xs text-slate-500">
                {rideMin(ride)} bekat
                {ride.route.schedule &&
                  ` · ${ride.route.schedule.firstDeparture}–${ride.route.schedule.lastDeparture}, har ${ride.route.schedule.intervalMin} daqiqada`}
              </p>
            </div>
          </li>
        ))}

        <li className="flex gap-3 py-3">
          <WalkIcon n={j.rides.length + 2} />
          <div className="min-w-0 text-sm">
            <p className="font-semibold">
              Piyoda: {j.rides[j.rides.length - 1].alightStop.name} bekatidan manzilgacha
            </p>
            <p className="text-xs text-slate-500">
              {formatDistance(j.walkToDestination.distanceM)} · taxminan{" "}
              {j.walkToDestination.durationMin} daqiqa
            </p>
          </div>
        </li>
      </ol>

      <p className="text-[11px] text-slate-400">
        Piyoda masofa taxminiy hisoblangan. Xaritada punktir chiziq piyoda yo'lni ko'rsatadi.
      </p>
    </div>
  );
}
