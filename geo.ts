import type { LatLng } from "@/types/transit";

const EARTH_RADIUS_M = 6371000;

/** Piyoda yo'l to'g'ri chiziqdan uzunroq bo'ladi (burilishlar, kvartallar) */
export const WALK_DETOUR = 1.3;
/** Piyoda tezligi: ~4.8 km/soat */
export const WALK_M_PER_MIN = 80;

/** Ikki nuqta orasidagi to'g'ri chiziq masofasi (metr) */
export function haversineM(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Taxminiy piyoda masofa (metr) */
export function walkDistanceM(a: LatLng, b: LatLng): number {
  return haversineM(a, b) * WALK_DETOUR;
}

export function walkMinutes(distanceM: number): number {
  return Math.max(1, Math.round(distanceM / WALK_M_PER_MIN));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.max(10, Math.round(m / 10) * 10)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}
