/** Geografik nuqta */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Excel: "stops" varag'i — bitta qator = bitta bekat */
export interface Stop {
  id: string; // masalan "S001"
  name: string; // "Do'stlik ko'chasi"
  lat: number;
  lng: number;
  /** Ixtiyoriy: qo'shimcha izoh ("bozor oldida") */
  note?: string;
  /** Kelajakda boshqa tumanlar uchun */
  districtId?: string; // "nukus"
}

export type TransportType = "bus" | "marshrutka";

/** Excel: "routes" varag'i — bitta qator = bitta yo'nalish */
export interface Route {
  id: string; // "R12"
  number: string; // "12" yoki "5-A"
  type: TransportType;
  name?: string; // "Vokzal — Bozor"
  color?: string; // "#0d9488"
  /** Bekat ID'lari tartib bilan (borish yo'nalishi) */
  stopIds: string[];
  /** true bo'lsa teskari yo'nalishda ham yuradi (stopIds teskari tartibda) */
  bidirectional: boolean;
  /** Faqat avtobuslar uchun, ixtiyoriy */
  schedule?: BusSchedule;
  districtId?: string;
}

export interface BusSchedule {
  firstDeparture: string; // "06:00"
  lastDeparture: string; // "22:00"
  intervalMin: number; // har necha daqiqada
}

/** Excel'dan yig'ilgan to'liq ma'lumotlar bazasi (public/data/transit.json) */
export interface TransitData {
  version: string; // "2026-10-06"
  stops: Stop[];
  routes: Route[];
}

/* ---------- Qidiruv natijasi ---------- */

/** Marshrutning bir bo'lagi: qayerdan minib, qayerda tushish */
export interface RideLeg {
  route: Route;
  boardStop: Stop;
  alightStop: Stop;
  stopsCount: number;
  /** Shu bo'lakdagi bekatlar (xaritada chizish uchun) */
  path: Stop[];
}

export interface WalkLeg {
  from: LatLng;
  to: LatLng;
  distanceM: number;
  durationMin: number;
  /** Agar yo'l geometriyasi bo'lsa (OSRM), aks holda to'g'ri chiziq */
  geometry?: LatLng[];
}

export interface Journey {
  id: string;
  /** Boshlang'ich nuqtadan bekatgacha piyoda */
  walkToBoard: WalkLeg;
  rides: RideLeg[]; // 1 ta (to'g'ridan-to'g'ri) yoki 2 ta (1 marta almashish)
  /** Tushgandan keyin manzilgacha piyoda */
  walkToDestination: WalkLeg;
  totalWalkM: number;
  transfers: number;
}
