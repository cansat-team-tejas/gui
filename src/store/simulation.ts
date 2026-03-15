import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SimulationMode = "gui" | "cansat";

interface SimulationStore {
  mode: SimulationMode;
  isRunning: boolean;
  elapsedSeconds: number;
  setMode: (mode: SimulationMode) => void;
  setElapsed: (seconds: number) => void;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set) => ({
      mode: "gui",
      isRunning: true,
      elapsedSeconds: 0,
      setMode: (mode) =>
        set({ mode, isRunning: mode === "gui", elapsedSeconds: 0 }),
      setElapsed: (elapsedSeconds) => set({ elapsedSeconds }),
      start: () => set({ isRunning: true, elapsedSeconds: 0 }),
      stop: () => set({ isRunning: false }),
      reset: () => set({ isRunning: false, elapsedSeconds: 0 }),
    }),
    { name: "simulation-store", partialize: (s) => ({ mode: s.mode }) }
  )
);
