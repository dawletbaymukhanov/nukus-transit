import MapView from "@/components/map/MapView";
import { useTripStore } from "@/store/useTripStore";

export default function PlannerPage() {
  const { from, to, picking, setPicking, swap, reset } = useTripStore();

  const hint =
    picking === "from"
      ? "Xaritada boshlang'ich joyni bosing"
      : picking === "to"
        ? "Xaritada boriladigan joyni bosing"
        : !from
          ? "Xaritani bosib A nuqtani (qayerdan) belgilang"
          : !to
            ? "Endi B nuqtani (qayerga) belgilang"
            : "Nuqtani o'zgartirish uchun yuqoridagi maydonni bosing";

  const field = (active: boolean) =>
    `flex w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
      active ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-300"
    }`;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 bg-white p-3 shadow-sm">
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
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{hint}</span>
          <span className="flex gap-3">
            <button onClick={swap} className="font-medium text-teal-700">
              ⇅ Almashtirish
            </button>
            <button onClick={reset} className="font-medium text-slate-500">
              Tozalash
            </button>
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <MapView />
      </div>
    </div>
  );
}
