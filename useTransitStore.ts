import { create } from "zustand";
import type { Route, Stop, TransitData } from "@/types/transit";

interface TransitState {
  stops: Stop[];
  routes: Route[];
  version: string | null;
  status: "idle" | "loading" | "ready" | "error";
  error?: string;
  load: () => Promise<void>;
  stopById: (id: string) => Stop | undefined;
}

export const useTransitStore = create<TransitState>((set, get) => ({
  stops: [],
  routes: [],
  version: null,
  status: "idle",

  async load() {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading" });
    try {
      const res = await fetch("/data/transit.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as TransitData;
      set({
        stops: data.stops,
        routes: data.routes,
        version: data.version,
        status: "ready",
      });
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  stopById: (id) => get().stops.find((s) => s.id === id),
}));
