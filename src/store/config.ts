import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
  backendUrl: string | number;
  setBackendUrl: (url: string | number) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      backendUrl: (() => {
        const envUrl = (import.meta as any).env.VITE_API_URL;
        if (envUrl) {
          return isNaN(Number(envUrl)) ? envUrl : Number(envUrl);
        }
        return 8000;
      })(),
      setBackendUrl: (url) => set({ backendUrl: url }),
    }),
    {
      name: "cansat-config-storage",
    }
  )
);
