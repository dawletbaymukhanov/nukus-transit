import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { useTransitStore } from "@/store/useTransitStore";
import { useTripStore, type Place } from "@/store/useTripStore";

/** Nukus shahri markazi */
const NUKUS_CENTER: [number, number] = [42.46, 59.61];
const DEFAULT_ZOOM = 14;

// Leaflet'ning standart rasmli belgilari Vite bilan muammo beradi, shuning uchun divIcon ishlatamiz
const pinIcon = (text: string, cls: string) =>
  L.divIcon({
    className: "",
    html: `<div class="map-pin ${cls}">${text}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const FROM_ICON = pinIcon("A", "map-pin-from");
const TO_ICON = pinIcon("B", "map-pin-to");
const STOP_ICON = L.divIcon({
  className: "",
  html: '<div class="map-stop"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
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

export default function MapView() {
  const stops = useTransitStore((s) => s.stops);
  const routes = useTransitStore((s) => s.routes);
  const stopById = useTransitStore((s) => s.stopById);
  const from = useTripStore((s) => s.from);
  const to = useTripStore((s) => s.to);
  const pick = usePlacePicker();

  return (
    <MapContainer
      center={NUKUS_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={11}
      maxZoom={19}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains={["a", "b", "c"]}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapClickHandler />

      {/* Yo'nalish chiziqlari */}
      {routes.map((r) => {
        const positions = r.stopIds
          .map(stopById)
          .filter((s): s is NonNullable<typeof s> => Boolean(s))
          .map((s) => [s.lat, s.lng] as [number, number]);
        return (
          <Polyline
            key={r.id}
            positions={positions}
            pathOptions={{ color: r.color ?? "#0d9488", weight: 5, opacity: 0.75 }}
          />
        );
      })}

      {/* Bekatlar: bosilsa A yoki B sifatida tanlanadi */}
      {stops.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={STOP_ICON}
          eventHandlers={{
            click: () => pick({ lat: s.lat, lng: s.lng, label: s.name }),
          }}
        >
          <Tooltip direction="right" offset={[8, 0]}>
            {s.name}
          </Tooltip>
        </Marker>
      ))}

      {from && (
        <Marker position={[from.lat, from.lng]} icon={FROM_ICON} zIndexOffset={1000} />
      )}
      {to && (
        <Marker position={[to.lat, to.lng]} icon={TO_ICON} zIndexOffset={1000} />
      )}
    </MapContainer>
  );
}
