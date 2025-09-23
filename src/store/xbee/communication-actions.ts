/**
 * XBee Store - Communication Actions
 */
import type { ICommandType, ILogEntryType } from "../../types/telemetry";
import type { XBeeStore, CommunicationActions } from "./types";
import { boundedUnshift } from "./helpers";

export const createCommunicationActions = (
  set: any,
  get: () => XBeeStore
): CommunicationActions => ({
  addCommandEcho: (command: ICommandType) =>
    set((state: XBeeStore) => {
      boundedUnshift(state.communication.commandEchoHistory, command, 100);
      state.statistics.frameStats.commandEchoCount += 1;
    }),

  addLogEntry: (log: ILogEntryType) =>
    set((state: XBeeStore) => {
      boundedUnshift(state.communication.logEntries, log, 500);
      state.statistics.frameStats.logEntryCount += 1;
    }),

  clearCommandHistory: () =>
    set((state: XBeeStore) => {
      state.communication.commandEchoHistory = [];
    }),

  clearLogEntries: () =>
    set((state: XBeeStore) => {
      state.communication.logEntries = [];
    }),

  getRecentLogs: (count = 50) => get().communication.logEntries.slice(0, count),

  getRecentCommands: (count = 20) =>
    get().communication.commandEchoHistory.slice(0, count),

  updateRSSI: (uplink?: number, downlink?: number) =>
    set((state: XBeeStore) => {
      if (uplink !== undefined) state.communication.rssi.uplink = uplink;
      if (downlink !== undefined) state.communication.rssi.downlink = downlink;
      state.communication.rssi.lastUpdate = new Date();
    }),

  getRSSI: async () => {
    try {
      // For now, extract RSSI from telemetry data if available
      const { communication } = get();
      return {
        uplink: communication.rssi.uplink,
        downlink: communication.rssi.downlink,
      };
    } catch (error) {
      console.error("Failed to get RSSI:", error);
      return { uplink: null, downlink: null };
    }
  },
});
