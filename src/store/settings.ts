/**
 * Settings state store
 * Centralized Zustand store for settings-related UI state and backend configuration
 */
import { create } from "zustand";
import { BACKEND_CONFIG } from "../constants";
import { xbeeGoAPI } from "../utils/xbee-go-api";
import type { SettingsState, ConfirmationState } from "../pages/settings/types";

const createDefaultConfirmationState = (): ConfirmationState => ({
  isOpen: false,
  command: null,
  timeoutId: null,
  timeRemaining: 30,
});

const isBrowser = typeof window !== "undefined";

const readNumber = (key: string, fallback: number): number => {
  if (!isBrowser) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
};

const readString = (key: string, fallback: string | null): string | null => {
  if (!isBrowser) return fallback;
  const value = window.localStorage.getItem(key);
  return value !== null ? value : fallback;
};

const initialBackendURL =
  readString("xbeeBackendURL", BACKEND_CONFIG.BACKEND_URL) ||
  BACKEND_CONFIG.BACKEND_URL;

if (initialBackendURL && initialBackendURL !== BACKEND_CONFIG.BACKEND_URL) {
  xbeeGoAPI.updateBaseURL(initialBackendURL);
}

export interface SettingsStore extends SettingsState {
  setConnectionStatus: (status: string) => void;
  setCommandStatus: (status: string) => void;
  setShowResetConfirm: (value: boolean) => void;
  setResetTimeout: (timeout: NodeJS.Timeout | null) => void;
  setConfirmationState: (
    state: ConfirmationState | ((prev: ConfirmationState) => ConfirmationState)
  ) => void;
  resetConfirmationState: () => void;
  setAiServicePort: (port: number) => void;
  setCurrentDatabaseFilename: (filename: string | null) => void;
  setXbeeBackendURL: (url: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  connectionStatus: "",
  commandStatus: "",
  showResetConfirm: false,
  resetTimeout: null,
  confirmationState: createDefaultConfirmationState(),
  aiServicePort: readNumber("aiServicePort", 8000),
  currentDatabaseFilename: readString("currentDatabaseFilename", null),
  xbeeBackendURL: initialBackendURL,

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setCommandStatus: (status) => set({ commandStatus: status }),
  setShowResetConfirm: (value) => set({ showResetConfirm: value }),
  setResetTimeout: (timeout) => set({ resetTimeout: timeout }),
  setConfirmationState: (updater) =>
    set((state) => {
      const nextState =
        typeof updater === "function"
          ? (updater as (prev: ConfirmationState) => ConfirmationState)(
              state.confirmationState
            )
          : updater;

      return {
        confirmationState: { ...nextState },
      };
    }),
  resetConfirmationState: () =>
    set({ confirmationState: createDefaultConfirmationState() }),
  setAiServicePort: (port) => {
    if (isBrowser) {
      window.localStorage.setItem("aiServicePort", String(port));
    }
    set({ aiServicePort: port });
  },
  setCurrentDatabaseFilename: (filename) => {
    if (isBrowser) {
      if (filename) {
        window.localStorage.setItem("currentDatabaseFilename", filename);
      } else {
        window.localStorage.removeItem("currentDatabaseFilename");
      }
    }
    set({ currentDatabaseFilename: filename });
  },
  setXbeeBackendURL: (url) => {
    if (isBrowser) {
      window.localStorage.setItem("xbeeBackendURL", url);
    }
    xbeeGoAPI.updateBaseURL(url);
    set({ xbeeBackendURL: url });
  },
}));
