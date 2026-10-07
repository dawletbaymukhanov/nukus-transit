import { useTransitStore } from "@/store/useTransitStore";

export default function StopsPage() {
  const stops = useTransitStore((s) => s.stops);

  return (
    <ul className="divide-y divide-slate-200 bg-white">
      {stops.map((s) => (
        <li key={s.id} className="px-4 py-3">
          <p className="text-sm font-medium">{s.name}</p>
          <p className="text-xs text-slate-500">
            {s.lat.toFixed(5)}, {s.lng.toFixed(5)}
          </p>
        </li>
      ))}
    </ul>
  );
}
