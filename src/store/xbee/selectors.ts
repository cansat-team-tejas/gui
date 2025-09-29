/**
 * XBee Store Selectors
 * Centralized selectors for optimized subscriptions
 */
import type { XBeeStore } from "./types";

export const xbeeSelectors = {
  // === TELEMETRY SELECTORS ===
  latestTelemetry: (s: XBeeStore) => s.telemetry.history[0] ?? null,
  telemetryHistory: (s: XBeeStore) => s.telemetry.history,
  dataRate: (s: XBeeStore) => s.telemetry.dataRate,
  missionDuration: (s: XBeeStore) => s.telemetry.totalMissionTime,
  missionStartTime: (s: XBeeStore) => s.telemetry.missionStartTime,

  // === CONNECTION SELECTORS ===
  isConnected: (s: XBeeStore) => s.connection.isConnected,
  availablePorts: (s: XBeeStore) => s.connection.availablePorts,
  selectedPort: (s: XBeeStore) => s.connection.selectedPort,
  connectionTime: (s: XBeeStore) => s.connection.connectionTime,
  autoDetecting: (s: XBeeStore) => s.connection.autoDetecting,

  // === COMMUNICATION SELECTORS ===
  lastCommandEcho: (s: XBeeStore) =>
    s.communication.commandEchoHistory[0] ?? null,
  commandEchoHistory: (s: XBeeStore) => s.communication.commandEchoHistory,
  logEntries: (s: XBeeStore) => s.communication.logEntries,
  recentLogs: (s: XBeeStore) => s.communication.logEntries.slice(0, 50),
  rssiUplink: (s: XBeeStore) => s.communication.rssi.uplink,
  rssiDownlink: (s: XBeeStore) => s.communication.rssi.downlink,
  rssiLastUpdate: (s: XBeeStore) => s.communication.rssi.lastUpdate,
  rssiPollingActive: (s: XBeeStore) => s.communication.rssiPolling.isActive,
  rssiPollingInterval: (s: XBeeStore) => s.communication.rssiPolling.interval,
  rssiPollingLastTime: (s: XBeeStore) =>
    s.communication.rssiPolling.lastPollTime,

  // === STATISTICS SELECTORS ===
  connectionStats: (s: XBeeStore) => ({
    packetsReceived: s.statistics.packetsReceived,
    packetsSent: s.statistics.packetsSent,
    errorsCount: s.statistics.errorsCount,
  }),
  processingStats: (s: XBeeStore) => ({
    processingErrors: s.statistics.processingErrors,
    totalFramesProcessed: s.statistics.totalFramesProcessed,
  }),
  frameStats: (s: XBeeStore) => s.statistics.frameStats,

  // === ACTIVITY SELECTORS ===
  activityLog: (s: XBeeStore) => s.activity.log,
  recentActivity: (s: XBeeStore) => s.activity.log.slice(0, 50),
};
