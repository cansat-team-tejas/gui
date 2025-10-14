import { useMemo } from "react";
import { useXBeeGoStore, xbeeGoSelectors } from "../store/xbee-go";

/**
 * Updated XBee hooks using the Go backend store architecture
 * These hooks provide optimized access to specific parts of the XBee Go store
 * Now using Go backend APIs instead of legacy Electron communication
 */

/**
 * Hook for specific telemetry data with optimized selectors
 */
export const useTelemetry = () => {
  const latest = useXBeeGoStore(xbeeGoSelectors.latestTelemetry);
  const history = useXBeeGoStore(xbeeGoSelectors.telemetryHistory);
  const dataRate = useXBeeGoStore(xbeeGoSelectors.dataRate);
  const missionDuration = useXBeeGoStore(xbeeGoSelectors.missionDuration);

  return {
    latest,
    history,
    dataRate,
    missionDuration,
  };
};

/**
 * Individual telemetry selectors to prevent object recreation
 */
export const useTelemetryLatest = () =>
  useXBeeGoStore(xbeeGoSelectors.latestTelemetry);
export const useTelemetryHistory = () =>
  useXBeeGoStore(xbeeGoSelectors.telemetryHistory);
export const useTelemetryDataRate = () =>
  useXBeeGoStore(xbeeGoSelectors.dataRate);
export const useTelemetryMissionDuration = () =>
  useXBeeGoStore(xbeeGoSelectors.missionDuration);

/**
 * Hook for connection state with optimized selectors
 * Note: This hook creates objects - prefer individual selectors for better performance
 */
export const useConnection = () => {
  const isConnected = useXBeeGoStore(xbeeGoSelectors.isConnected);
  const selectedPort = useXBeeGoStore(xbeeGoSelectors.selectedPort);
  const stats = useXBeeGoStore(xbeeGoSelectors.connectionStats);

  // Use useMemo to prevent object recreation on every render
  return useMemo(
    () => ({
      isConnected,
      selectedPort,
      connectionStats: {
        packetsReceived: stats.packetsReceived,
        packetsSent: stats.packetsSent,
        errorsCount: stats.errorsCount,
      },
    }),
    [
      isConnected,
      selectedPort,
      stats.packetsReceived,
      stats.packetsSent,
      stats.errorsCount,
    ]
  );
};

/**
 * Individual connection selectors to prevent object recreation
 */
export const useIsConnected = () => useXBeeGoStore(xbeeGoSelectors.isConnected);
export const useSelectedPort = () =>
  useXBeeGoStore(xbeeGoSelectors.selectedPort);
export const useConnectionStats = () => {
  const stats = useXBeeGoStore(xbeeGoSelectors.connectionStats);
  return useMemo(
    () => ({
      packetsReceived: stats.packetsReceived,
      packetsSent: stats.packetsSent,
      errorsCount: stats.errorsCount,
    }),
    [stats.packetsReceived, stats.packetsSent, stats.errorsCount]
  );
};

/**
 * Hook for getting telemetry data with time range filtering
 */
export const useTelemetryByTimeRange = (startTime?: Date, endTime?: Date) => {
  return useXBeeGoStore((state) => {
    if (!startTime || !endTime) {
      return state.telemetry.history;
    }
    return state.getTelemetryByTimeRange(startTime, endTime);
  });
};

/**
 * Hook for getting recent telemetry (for performance in components)
 */
export const useRecentTelemetry = (count: number = 100) => {
  return useXBeeGoStore((state) => state.telemetry.history.slice(0, count));
};

/**
 * Utility hook for mission statistics
 */
export const useMissionStats = () => {
  const duration = useXBeeGoStore((state) => state.telemetry.totalMissionTime);
  const packetsReceived = useXBeeGoStore(
    (state) => state.statistics.packetsReceived
  );
  const dataRate = useXBeeGoStore((state) => state.telemetry.dataRate);
  const missionStartTime = useXBeeGoStore(
    (state) => state.telemetry.missionStartTime
  );
  const totalDataPoints = useXBeeGoStore(
    (state) => state.telemetry.history.length
  );

  return {
    duration,
    packetsReceived,
    dataRate,
    missionStartTime,
    totalDataPoints,
  };
};

/**
 * Individual mission stat selectors to prevent object recreation
 */
export const useMissionDuration = () =>
  useXBeeGoStore((state) => state.telemetry.totalMissionTime);
export const useMissionPacketsReceived = () =>
  useXBeeGoStore((state) => state.statistics.packetsReceived);
export const useMissionPacketsSent = () =>
  useXBeeGoStore((state) => state.statistics.packetsSent);
export const useMissionDataRate = () =>
  useXBeeGoStore((state) => state.telemetry.dataRate);
export const useMissionStartTime = () =>
  useXBeeGoStore((state) => state.telemetry.missionStartTime);
export const useTotalDataPoints = () =>
  useXBeeGoStore((state) => state.telemetry.history.length);

/**
 * Hook for command echo data with optimized selectors
 */
export const useCommandEcho = () => {
  const lastCommandEcho = useXBeeGoStore(xbeeGoSelectors.lastCommandEcho);
  const commandHistory = useXBeeGoStore(xbeeGoSelectors.commandEchoHistory);

  return {
    lastCommandEcho,
    commandHistory,
  };
};

/**
 * Individual command echo selectors to prevent object recreation
 */
export const useLastCommandEcho = () =>
  useXBeeGoStore(xbeeGoSelectors.lastCommandEcho);
export const useCommandHistory = () =>
  useXBeeGoStore(xbeeGoSelectors.commandEchoHistory);

/**
 * Hook for log entries with optimized selectors
 */
export const useLogEntries = () => {
  const logEntries = useXBeeGoStore(xbeeGoSelectors.logEntries);
  const recentLogs = useXBeeGoStore(xbeeGoSelectors.recentLogs);

  return {
    logEntries,
    recentLogs,
  };
};

/**
 * Individual log selectors to prevent object recreation
 */
export const useLogEntriesData = () =>
  useXBeeGoStore(xbeeGoSelectors.logEntries);
export const useRecentLogs = () => useXBeeGoStore(xbeeGoSelectors.recentLogs);

/**
 * Hook for frame processing statistics
 */
export const useFrameProcessing = () => {
  const stats = useXBeeGoStore(xbeeGoSelectors.processingStats);
  const frameStats = useXBeeGoStore(xbeeGoSelectors.frameStats);
  const clearStats = useXBeeGoStore((state) => state.resetProcessingStats);

  return useMemo(
    () => ({
      processingErrors: stats.processingErrors,
      totalFramesProcessed: stats.totalFramesProcessed,
      ...frameStats,
      clearStats,
    }),
    [stats.processingErrors, stats.totalFramesProcessed, frameStats, clearStats]
  );
};

/**
 * Hook for activity log data
 */
export const useActivityLog = () => {
  const activityLog = useXBeeGoStore(xbeeGoSelectors.activityLog);

  return {
    activityLog,
    recentActivity: activityLog.slice(0, 50),
    clearLog: useXBeeGoStore((state) => state.clearActivityLog),
  };
};

/**
 * Individual activity log selectors to prevent object recreation
 */
export const useActivityLogData = () =>
  useXBeeGoStore(xbeeGoSelectors.activityLog);
export const useRecentActivity = () => {
  const activityLog = useXBeeGoStore(xbeeGoSelectors.activityLog);
  return activityLog.slice(0, 50);
};
export const useClearActivityLog = () =>
  useXBeeGoStore((state) => state.clearActivityLog);

/**
 * Hook for transmitting commands
 */
export const useTransmit = () => useXBeeGoStore((state) => state.transmit);

/**
 * Hook for mission management actions
 */
export const useMissionActions = () => {
  const getCurrentMission = useXBeeGoStore((state) => state.getCurrentMission);
  const endCurrentMission = useXBeeGoStore((state) => state.endCurrentMission);
  const currentMission = useXBeeGoStore(
    (state) => state.mission.currentMission
  );

  return {
    getCurrentMission,
    endCurrentMission,
    currentMission,
  };
};

/**
 * Hook for WebSocket connection management
 */
export const useWebSocketConnection = () => {
  const connectWebSocket = useXBeeGoStore((state) => state.connectWebSocket);
  const disconnectWebSocket = useXBeeGoStore(
    (state) => state.disconnectWebSocket
  );
  const isWebSocketConnected = useXBeeGoStore(
    (state) => state.isWebSocketConnected
  );

  return {
    connectWebSocket,
    disconnectWebSocket,
    isWebSocketConnected: isWebSocketConnected(),
  };
};

/**
 * Hook for connection health monitoring
 */
export const useConnectionHealth = () => {
  const connectionHealth = useXBeeGoStore(
    (state) => state.connection.connectionHealth
  );
  const updateConnectionHealth = useXBeeGoStore(
    (state) => state.updateConnectionHealth
  );

  return {
    connectionHealth,
    updateConnectionHealth,
  };
};

/**
 * Hook for loading telemetry data from Go backend
 */
export const useTelemetryLoader = () => {
  const loadTelemetryHistory = useXBeeGoStore(
    (state) => state.loadTelemetryHistory
  );

  return {
    loadTelemetryHistory,
  };
};
