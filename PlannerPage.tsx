import { useEffect, useMemo, useState } from "react";
import MapView from "@/components/map/MapView";
import JourneyPanel from "@/components/results/JourneyPanel";
import { formatDistance, haversineM } from "@/lib/geo";
import { nearestStops, planJourneys } from "@/lib/planner";
import { useTransitStore } from "@/store/useTransitStore";
import { useTripStore } from "@/store/useTripStore";

export default function PlannerPage() {
  const { from, to, picking, setPicking, setFrom, swap, reset } = useTripStore();
  const { stops, routes, status } = useTransitStore();
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const journeys = useMemo(
    () => (from && to && status === "ready" ? planJourneys(from, to, routes, stops) : []),
    [from, to, routes, stops, status],
  );

  // A yoki B o'zgarsa, birinchi variant tanlanadi va panel yig'iladi (xarita katta qoladi)
  useEffect(() => {
    setSel(0);
    setOpen(false);
  }, [from, to]);

  const journey = journeys[sel] ?? null;
  const both = Boolean(from && to);
  const closeBy = from && to && haversineM(from, to) < 400;

  const hint =
    picking === "from"
      ? "Xaritada boshlang'ich joyni bosing"
      : picking === "to"
        ? "Xaritada boriladigan joyni bosing"
        : !from
          ? "Xaritani bosib A nuqtani belgilang"
          : !to
            ? "Endi B nuqtani belgilang"
            : "Nuqtani o'zgartirish uchun A yoki B ni bosing";

  const locate = () => {
    setGeoError(null);
    if (!navigator.geolocation) return setGeoError("Telefon joylashuvni bermayapti");
    navigator.geolocation.getCurrentPosition(
      (p) => setFrom({ lat: p.coords.latitude, lng: p.coords.longitude, label: "Mening joyim" }),
      () => setGeoError("Joylashuvga ruxsat berilmadi"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const field = (active: boolean) =>
    `flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm ${
      active ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-300"
    }`;

  return (
    <div className="flex h-full flex-col">
      {/* Yuqori qism ixcham: xaritaga ko'proq joy qoladi */}
      <div className="space-y-1.5 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setPicking("from")} className={field(picking === "from")}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              A
            </span>
            <span className="truncate">{from?.label ?? "Qayerdan"}</span>
          </button>
          <button onClick={() => setPicking("to")} className={field(picking === "to")}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              B
            </span>
            <span className="truncate">{to?.label ?? "Qayerga"}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-0.5 text-xs">
          <span className="text-slate-500">{geoError ?? hint}</span>
          <span className="flex gap-3">
            <button onClick={locate} className="py-1 font-medium text-teal-700">
              Mening joyim
            </button>
            <button onClick={swap} className="py-1 font-medium text-teal-700">
              ⇅
            </button>
            <button onClick={reset} className="py-1 font-medium text-slate-500">
              Tozalash
            </button>
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <MapView journey={journey} />
      </div>

      {both && (
        <div className="shrink-0 border-t border-slate-200 bg-slate-50">
          {status === "loading" && <p className="p-4 text-sm text-slate-500">Ma'lumotlar yuklanmoqda…</p>}
          {status === "error" && (
            <p className="p-4 text-sm text-red-600">Ma'lumotlarni yuklab bo'lmadi. Internetni tekshiring.</p>
          )}

          {closeBy && (
            <p className="m-2 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-900">
              Bu ikki nuqta yaqin (taxminan {formatDistance(haversineM(from!, to!))}). Piyoda borish qulayroq
              bo'lishi mumkin.
            </p>
          )}

          {/* Natija: yig'ilgan holatda bitta qator, bosilsa ochiladi */}
          {status === "ready" && journey && (
            <>
              <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {journey.rides.map((r, k) => (
                    <span key={r.route.id + k} className="flex items-center gap-1.5">
                      {k > 0 && <span className="text-slate-400">→</span>}
                      <span
                        className="rounded-md px-2 py-0.5 text-sm font-bold text-white"
                        style={{ background: r.route.color ?? "#0d9488" }}
                      >
                        {r.route.number}
                      </span>
                    </span>
                  ))}
                  <span className="truncate text-xs text-slate-600">
                    piyoda {formatDistance(journey.totalWalkM)}
                    {journey.transfers > 0 && " · 1 marta almashish"}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-teal-700">
                  {open ? "Yopish ▼" : "Batafsil ▲"}
                </span>
              </button>
              {open && (
                <div className="max-h-[45vh] overflow-y-auto border-t border-slate-200">
                  <JourneyPanel journeys={journeys} selected={sel} onSelect={setSel} />
                </div>
              )}
            </>
          )}

          {status === "ready" && journeys.length === 0 && (
            <div className="space-y-1 p-4 text-sm">
              <p className="font-semibold">Mos marshrut topilmadi</p>
              <p className="text-slate-600">
                Bu ikki nuqta orasida to'g'ridan-to'g'ri yoki 1 marta almashish bilan boradigan yo'nalish yo'q,
                yoki bekatlar 1,2 km dan uzoqda.
              </p>
              <p className="text-xs text-slate-500">
                Eng yaqin bekat A ga:{" "}
                {nearestStops(from!, stops, 1)
                  .map((x) => `${x.stop.name} (${formatDistance(x.distanceM)})`)
                  .join(", ")}
                . B ga:{" "}
                {nearestStops(to!, stops, 1)
                  .map((x) => `${x.stop.name} (${formatDistance(x.distanceM)})`)
                  .join(", ")}
                .
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
