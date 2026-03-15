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

  getRSSI: () => {
    const { communication } = get();
    return {
      uplink: communication.rssi.uplink,
      downlink: communication.rssi.downlink,
    };
  },

  sendATCommand: async (command: string) => {
    try {
      if (!window.electronAPI?.xbee || !get().connection.isConnected) {
        return false;
      }

      const frame = {
        type: 0x08,
        id: Math.floor(Math.random() * 255) + 1,
        command: command,
        commandParameter: new Uint8Array([]),
      };

      const result = await window.electronAPI.xbee.sendFrame(frame);

      if (result.success) {
        set((state: XBeeStore) => {
          state.statistics.packetsSent += 1;
        });
        get().addActivity("FRAME_SENT", "AT_COMMAND", `AT${command}`);
        return true;
      }
      return false;
    } catch (error) {
      get().addActivity("ERROR", undefined, `AT command failed: ${command}`);
      return false;
    }
  },

  startRSSIPolling: (intervalMs: number = 5000) => {
    const store = get();

    // Stop any existing polling
    if (store.communication.rssiPolling.timerId) {
      clearInterval(store.communication.rssiPolling.timerId);
    }

    // Start polling for downlink RSSI only (uplink comes from telemetry)
    const pollDownlinkRSSI = async () => {
      try {
        await store.sendATCommand("DB"); // Get downlink RSSI only

        set((state: XBeeStore) => {
          state.communication.rssiPolling.lastPollTime = new Date();
        });
      } catch (error) {
        // Silent fail - RSSI polling is non-critical
      }
    };

    const timerId = setInterval(pollDownlinkRSSI, intervalMs);

    set((state: XBeeStore) => {
      state.communication.rssiPolling.isActive = true;
      state.communication.rssiPolling.interval = intervalMs;
      state.communication.rssiPolling.timerId = timerId;
    });

    // Initial poll
    pollDownlinkRSSI();

    get().addActivity(
      "CONNECTION",
      undefined,
      `Started RSSI polling (${intervalMs}ms)`
    );
  },

  stopRSSIPolling: () => {
    set((state: XBeeStore) => {
      if (state.communication.rssiPolling.timerId) {
        clearInterval(state.communication.rssiPolling.timerId);
        state.communication.rssiPolling.timerId = null;
      }
      state.communication.rssiPolling.isActive = false;
      state.communication.rssiPolling.lastPollTime = null;
    });

    get().addActivity("CONNECTION", undefined, "Stopped RSSI polling");
  },
});
