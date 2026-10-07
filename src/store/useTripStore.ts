import { create } from "zustand";
import type { LatLng } from "@/types/transit";

export interface Place extends LatLng {
  label?: string;
}

interface TripState {
  from: Place | null;
  to: Place | null;
  /** Xaritada hozir qaysi nuqta tanlanayotgani */
  picking: "from" | "to" | null;
  setFrom: (p: Place | null) => void;
  setTo: (p: Place | null) => void;
  setPicking: (v: "from" | "to" | null) => void;
  swap: () => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  from: null,
  to: null,
  picking: null,
  setFrom: (from) => set({ from, picking: null }),
  setTo: (to) => set({ to, picking: null }),
  setPicking: (picking) => set({ picking }),
  swap: () => set((s) => ({ from: s.to, to: s.from })),
  reset: () => set({ from: null, to: null, picking: null }),
}));
