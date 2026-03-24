import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  xbeeDH: string;
  setXbeeDH: (dh: string) => void;
  xbeeDL: string;
  setXbeeDL: (dl: string) => void;
}

function resolveBackendUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) return envUrl;
  return "https://api.tejas.aspiredev.in";
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      backendUrl: resolveBackendUrl(),
      setBackendUrl: (url) => set({ backendUrl: url }),
      xbeeDH: "0013A200",
      setXbeeDH: (dh) => set({ xbeeDH: dh }),
      xbeeDL: "426E25F8",
      setXbeeDL: (dl) => set({ xbeeDL: dl }),
    }),
    { name: "cansat-config-storage" }
  )
);
