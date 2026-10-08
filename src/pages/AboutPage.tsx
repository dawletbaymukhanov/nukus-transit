import { useTransitStore } from "@/store/useTransitStore";

export default function AboutPage() {
  const { version, stops, routes } = useTransitStore();

  return (
    <div className="space-y-2 p-4 text-sm">
      <h2 className="text-base font-semibold">Nukus Transport</h2>
      <p className="text-slate-600">
        Nukus shahrida avtobus va marshrutkalar bo'yicha yo'l topish ilovasi.
      </p>
      <p className="text-slate-500">
        Ma'lumotlar versiyasi: {version ?? "—"} · {stops.length} bekat · {routes.length} yo'nalish
      </p>
      <p className="text-xs text-slate-400">
        Xarita va bekatlar: © OpenStreetMap contributors (ODbL), xarita uslubi © CARTO.
      </p>
    </div>
  );
}
