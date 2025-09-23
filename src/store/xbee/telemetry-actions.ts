/**
 * XBee Store - Telemetry Actions
 */
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

      // Add to history with bounded size
      boundedUnshift(state.telemetry.history, data, 1000);

      // Calculate data rate using exponential moving average
      const { rate, lastUpdate } = computeEmaDataRate(
        state.telemetry.dataRate,
        now,
        state.telemetry.lastUpdate
      );
      state.telemetry.dataRate = rate;
      state.telemetry.lastUpdate = lastUpdate;

      // Update mission timing
      const timing = nextMissionTiming(state.telemetry.missionStartTime, now);
      state.telemetry.missionStartTime = timing.missionStartTime;
      state.telemetry.totalMissionTime = timing.totalMissionTime;

      // Update statistics
      state.statistics.frameStats.telemetryCount += 1;

      // Update RSSI if available in telemetry data
      if (data.RSSI_DBM !== undefined && data.RSSI_DBM !== null) {
        state.communication.rssi.downlink = data.RSSI_DBM;
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
