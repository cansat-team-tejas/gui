import type { XBeeStore } from "./types";

export interface SystemActions {
  resetStore: () => void;
}

export const createSystemActions = (
  set: any,
  _get: () => XBeeStore
): SystemActions => ({
  resetStore: () =>
    set((state: XBeeStore) => {
      state.telemetry = {
        history: [],
        lastUpdate: null,
        dataRate: 0,
        missionStartTime: null,
        totalMissionTime: 0,
      };

      const currentPollingSettings = state.communication.rssiPolling;
      state.communication = {
        commandEchoHistory: [],
        logEntries: [],
        rssi: {
          uplink: null,
          downlink: null,
          lastUpdate: null,
        },
        rssiPolling: {
          ...currentPollingSettings,
          lastPollTime: null,
        },
      };

      state.statistics = {
        packetsReceived: 0,
        packetsSent: 0,
        errorsCount: 0,
        processingErrors: 0,
        totalFramesProcessed: 0,
        frameStats: {
          telemetryCount: 0,
          commandEchoCount: 0,
          logEntryCount: 0,
          unknownCount: 0,
        },
      };

      state.activity = { log: [] };

      // Connection state preserved intentionally to avoid mid-mission disconnects
    }),
});
