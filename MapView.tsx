import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useTransitStore } from "@/store/useTransitStore";
import { useTripStore, type Place } from "@/store/useTripStore";
import type { Journey, Stop } from "@/types/transit";

/** Nukus shahri markazi */
const NUKUS_CENTER: [number, number] = [42.46, 59.61];
const DEFAULT_ZOOM = 14;
/** Shu masshtabdan boshlab barcha bekatlar ko'rinadi (kichikroq masshtabda xarita to'lib ketmasligi uchun) */
const STOPS_MIN_ZOOM = 15;
const WALK_COLOR = "#475569";

// Leaflet'ning standart rasmli belgilari Vite bilan muammo beradi, shuning uchun divIcon ishlatamiz
const pinIcon = (text: string, cls: string) =>
  L.divIcon({
    className: "",
    html: `<div class="map-pin ${cls}">${text}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const FROM_ICON = pinIcon("A", "map-pin-from");
const TO_ICON = pinIcon("B", "map-pin-to");

// Bekat belgisi kichik ko'rinadi, lekin barmoq bilan bosiladigan joyi katta (32 px)
const STOP_ICON = L.divIcon({
  className: "",
  html: '<div class="map-stop-hit"><div class="map-stop"></div></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const STOP_ACTIVE_ICON = L.divIcon({
  className: "",
  html: '<div class="map-stop-hit"><div class="map-stop map-stop-active"></div></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

/** Keyingi bosilgan nuqta A yoki B ekanini hal qiladi */
function usePlacePicker() {
  const from = useTripStore((s) => s.from);
  const picking = useTripStore((s) => s.picking);
  const setFrom = useTripStore((s) => s.setFrom);
  const setTo = useTripStore((s) => s.setTo);

  return (place: Place) => {
    const target = picking ?? (!from ? "from" : "to");
    if (target === "from") setFrom(place);
    else setTo(place);
  };
}

function MapClickHandler() {
  const pick = usePlacePicker();
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      pick({
        lat,
        lng,
        label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    },
  });
  return null;
}

/** Xarita o'lchami o'zgarganda (pastki panel ochilsa/yopilsa) plitkalarni qayta joylaydi */
function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

/** Tanlangan marshrut o'zgarganda xarita uni to'liq ko'rsatadi */
function FitJourney({ journey }: { journey: Journey | null }) {
  const map = useMap();
  const from = useTripStore((s) => s.from);
  const to = useTripStore((s) => s.to);

  useEffect(() => {
    if (!journey) return;
    const pts: [number, number][] = [
      [journey.walkToBoard.from.lat, journey.walkToBoard.from.lng],
      [journey.walkToDestination.to.lat, journey.walkToDestination.to.lng],
      ...journey.rides.flatMap((r) => r.path.map((s) => [s.lat, s.lng] as [number, number])),
    ];
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 17 });
  }, [journey, map, from, to]);

  // Faqat A yoki B qo'yilganda (marshrut hali yo'q) xarita shu nuqtaga o'tadi
  useEffect(() => {
    if (journey) return;
    if (from && !to) map.panTo([from.lat, from.lng]);
    if (to && !from) map.panTo([to.lat, to.lng]);
  }, [from, to, journey, map]);

  return null;
}

interface StopMarkersProps {
  stops: Stop[];
  activeIds: Set<string>;
  onPick: (p: Place) => void;
}

function StopMarkers({ stops, activeIds, onPick }: StopMarkersProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const showAll = zoom >= STOPS_MIN_ZOOM;
  return (
    <>
      {stops
        .filter((s) => showAll || activeIds.has(s.id))
        .map((s) => {
          const active = activeIds.has(s.id);
          return (
            <Marker
              key={`${s.id}-${active ? "on" : "off"}`}
              position={[s.lat, s.lng]}
              icon={active ? STOP_ACTIVE_ICON : STOP_ICON}
              zIndexOffset={active ? 500 : 0}
              eventHandlers={{
                click: () => onPick({ lat: s.lat, lng: s.lng, label: s.name }),
              }}
            >
              <Tooltip direction="right" offset={[10, 0]} permanent={active}>
                {s.name}
              </Tooltip>
            </Marker>
          );
        })}
    </>
  );
}

interface Props {
  journey?: Journey | null;
}

export default function MapView({ journey = null }: Props) {
  const stops = useTransitStore((s) => s.stops);
  const routes = useTransitStore((s) => s.routes);
  const stopById = useTransitStore((s) => s.stopById);
  const from = useTripStore((s) => s.from);
  const to = useTripStore((s) => s.to);
  const pick = usePlacePicker();

  const activeStopIds = new Set<string>();
  journey?.rides.forEach((r) => {
    activeStopIds.add(r.boardStop.id);
    activeStopIds.add(r.alightStop.id);
  });

  return (
    <MapContainer
      center={NUKUS_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={11}
      maxZoom={19}
      zoomControl={false}
      className="h-full w-full"
    >
      {/* {r} telefonda "@2x" ga almashadi: plitkalar ikki barobar aniq (retina) */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <ZoomControl position="bottomright" />
      <ResizeFix />
      <MapClickHandler />
      <FitJourney journey={journey} />

      {/* Barcha yo'nalishlar (marshrut tanlanganda xira) */}
      {routes.map((r) => {
        const positions = r.stopIds
          .map(stopById)
          .filter((s): s is NonNullable<typeof s> => Boolean(s))
          .map((s) => [s.lat, s.lng] as [number, number]);
        return (
          <Polyline
            key={r.id}
            positions={positions}
            interactive={false}
            pathOptions={{
              color: r.color ?? "#0d9488",
              weight: journey ? 3 : 5,
              opacity: journey ? 0.25 : 0.75,
            }}
          />
        );
      })}

      {/* Tanlangan marshrut: avtobus/marshrutka qismlari */}
      {journey?.rides.map((ride, i) => (
        <Polyline
          key={`ride-${i}`}
          positions={ride.path.map((s) => [s.lat, s.lng] as [number, number])}
          interactive={false}
          pathOptions={{ color: ride.route.color ?? "#0d9488", weight: 8, opacity: 0.95 }}
        />
      ))}

      {/* Piyoda qismlari: punktir chiziq */}
      {journey &&
        [journey.walkToBoard, journey.walkToDestination].map((w, i) => (
          <Polyline
            key={`walk-${i}`}
            positions={(w.geometry ?? [w.from, w.to]).map((p) => [p.lat, p.lng] as [number, number])}
            interactive={false}
            pathOptions={{ color: WALK_COLOR, weight: 5, dashArray: "2 9", lineCap: "round" }}
          />
        ))}

      <StopMarkers stops={stops} activeIds={activeStopIds} onPick={pick} />

      {from && (
        <Marker position={[from.lat, from.lng]} icon={FROM_ICON} zIndexOffset={1000} />
      )}
      {to && (
        <Marker position={[to.lat, to.lng]} icon={TO_ICON} zIndexOffset={1000} />
      )}
    </MapContainer>
  );
}
