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
      // Reset telemetry
      state.telemetry = {
        history: [],
        lastUpdate: null,
        dataRate: 0,
        missionStartTime: null,
        totalMissionTime: 0,
      };

      // Reset communication but keep RSSI polling settings
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

      // Reset statistics
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

      // Clear activity log
      state.activity = {
        log: [],
      };

      // Note: Connection state is preserved to avoid disconnecting
    }),
});
