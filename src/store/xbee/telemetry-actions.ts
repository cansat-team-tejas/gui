import type { ITelemetryType } from "../../types/telemetry";
import type { XBeeStore, TelemetryActions } from "./types";
import {
  boundedUnshift,
  computeEmaDataRate,
  nextMissionTiming,
} from "./helpers";

export const createTelemetryActions = (
  set: any,
  get: () => XBeeStore
): TelemetryActions => ({
  updateTelemetry: (data: ITelemetryType) =>
    set((state: XBeeStore) => {
      const now = new Date();

      // Async push to MCP server if in CANSAT hardware mode
      import("../simulation").then(({ useSimulationStore }) => {
        if (useSimulationStore.getState().mode === "cansat") {
          import("../config").then(({ useConfigStore }) => {
            import("../../utils/mcp-service").then(({ createMCPService }) => {
              const url = useConfigStore.getState().backendUrl;
              createMCPService(url)
                .pushTelemetry(data)
                .catch((err) => console.error("Failed to push telemetry to MCP:", err));
            });
          });
        }
      });

      boundedUnshift(state.telemetry.history, data, 1000);

      const { rate, lastUpdate } = computeEmaDataRate(
        state.telemetry.dataRate,
        now,
        state.telemetry.lastUpdate
      );
      state.telemetry.dataRate = rate;
      state.telemetry.lastUpdate = lastUpdate;

      const timing = nextMissionTiming(state.telemetry.missionStartTime, now);
      state.telemetry.missionStartTime = timing.missionStartTime;
      state.telemetry.totalMissionTime = timing.totalMissionTime;

      state.statistics.frameStats.telemetryCount += 1;

      // Extract and store command echo if present (humanizes simulation/direct updates)
      if (data.CMD_ECHO && data.CMD_ECHO.trim()) {
        const commandEcho = {
          TEAM_ID: data.TEAM_ID || "046",
          MISSION_TIME: data.MISSION_TIME_S?.toString() || "",
          COMMAND_ECHO: data.CMD_ECHO,
          timestamp: new Date(),
        };
        // We use the internal state because we are inside a 'set' call (immer)
        boundedUnshift(state.communication.commandEchoHistory, commandEcho, 100);
        state.statistics.frameStats.commandEchoCount += 1;
      }

      // Extract and store log data if present
      if (data.LOG_DATA && data.LOG_DATA.trim()) {
        const logEntry = {
          TEAM_ID: data.TEAM_ID || "046",
          MISSION_TIME: data.MISSION_TIME_S?.toString() || "",
          MESSAGE: data.LOG_DATA,
          timestamp: new Date(),
        };
        boundedUnshift(state.communication.logEntries, logEntry, 500);
        state.statistics.frameStats.logEntryCount += 1;
      }

      if (data.RSSI_DBM !== undefined && data.RSSI_DBM !== null) {
        state.communication.rssi.uplink = data.RSSI_DBM;
        state.communication.rssi.lastUpdate = now;
      }
    }),

  clearTelemetry: () =>
    set((state: XBeeStore) => {
      state.telemetry.history = [];
      state.telemetry.lastUpdate = null;
      state.telemetry.dataRate = 0;
      state.telemetry.missionStartTime = null;
      state.telemetry.totalMissionTime = 0;
      state.statistics.packetsReceived = 0;
    }),

  getTelemetryByTimeRange: (startTime: Date, endTime: Date) => {
    const { telemetry } = get();
    if (!telemetry.missionStartTime) return [];

    return telemetry.history.filter((data) => {
      const dataTime = new Date(
        telemetry.missionStartTime!.getTime() +
          (data.MISSION_TIME_S || 0) * 1000
      );
      return dataTime >= startTime && dataTime <= endTime;
    });
  },
});
