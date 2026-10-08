import { useTransitStore } from "@/store/useTransitStore";

export default function RoutesPage() {
  const routes = useTransitStore((s) => s.routes);

  return (
    <ul className="divide-y divide-slate-200 bg-white">
      {routes.map((r) => (
        <li key={r.id} className="flex items-center gap-3 px-4 py-3">
          <span
            className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold text-white"
            style={{ background: r.color ?? "#0d9488" }}
          >
            {r.number}
          </span>
          <div>
            <p className="text-sm font-medium">{r.name}</p>
            <p className="text-xs text-slate-500">
              {r.type === "bus" ? "Avtobus" : "Marshrutka"} · {r.stopIds.length} bekat
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
