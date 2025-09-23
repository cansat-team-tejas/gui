import { useXBeeStore, xbeeSelectors } from "../store/xbee";

/**
 * Specialized XBee hooks using the modular store architecture
 * These hooks provide optimized access to specific parts of the XBee store
 * Use these instead of a monolithic useXBee hook for better performance
 */

/**
 * Hook for specific telemetry data with optimized selectors
 */
export const useTelemetry = () => {
  const latest = useXBeeStore(xbeeSelectors.latestTelemetry);
  const history = useXBeeStore(xbeeSelectors.telemetryHistory);
  const dataRate = useXBeeStore(xbeeSelectors.dataRate);
  const missionDuration = useXBeeStore(xbeeSelectors.missionDuration);

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
  useXBeeStore(xbeeSelectors.latestTelemetry);
export const useTelemetryHistory = () =>
  useXBeeStore(xbeeSelectors.telemetryHistory);
export const useTelemetryDataRate = () => useXBeeStore(xbeeSelectors.dataRate);
export const useTelemetryMissionDuration = () =>
  useXBeeStore(xbeeSelectors.missionDuration);

/**
 * Hook for connection state with optimized selectors
 */
export const useConnection = () => {
  const isConnected = useXBeeStore(xbeeSelectors.isConnected);
  const availablePorts = useXBeeStore(xbeeSelectors.availablePorts);
  const selectedPort = useXBeeStore(xbeeSelectors.selectedPort);
  const connectionStats = useXBeeStore(xbeeSelectors.connectionStats);

  return {
    isConnected,
    availablePorts,
    selectedPort,
    connectionStats,
  };
};

/**
 * Individual connection selectors to prevent object recreation
 */
export const useIsConnected = () => useXBeeStore(xbeeSelectors.isConnected);
export const useAvailablePorts = () =>
  useXBeeStore(xbeeSelectors.availablePorts);
export const useSelectedPort = () => useXBeeStore(xbeeSelectors.selectedPort);
export const useConnectionStats = () =>
  useXBeeStore(xbeeSelectors.connectionStats);

/**
 * Hook for getting telemetry data with time range filtering
 */
export const useTelemetryByTimeRange = (startTime?: Date, endTime?: Date) => {
  return useXBeeStore((state) => {
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
  return useXBeeStore((state) => state.telemetry.history.slice(0, count));
};

/**
 * Utility hook for mission statistics
 */
export const useMissionStats = () => {
  const duration = useXBeeStore((state) => state.telemetry.totalMissionTime);
  const packetsReceived = useXBeeStore(
    (state) => state.statistics.packetsReceived
  );
  const dataRate = useXBeeStore((state) => state.telemetry.dataRate);
  const missionStartTime = useXBeeStore(
    (state) => state.telemetry.missionStartTime
  );
  const totalDataPoints = useXBeeStore(
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
  useXBeeStore((state) => state.telemetry.totalMissionTime);
export const useMissionPacketsReceived = () =>
  useXBeeStore((state) => state.statistics.packetsReceived);
export const useMissionDataRate = () =>
  useXBeeStore((state) => state.telemetry.dataRate);
export const useMissionStartTime = () =>
  useXBeeStore((state) => state.telemetry.missionStartTime);
export const useTotalDataPoints = () =>
  useXBeeStore((state) => state.telemetry.history.length);

/**
 * Hook for command echo data with optimized selectors
 */
export const useCommandEcho = () => {
  const lastCommandEcho = useXBeeStore(xbeeSelectors.lastCommandEcho);
  const commandHistory = useXBeeStore(xbeeSelectors.commandEchoHistory);

  return {
    lastCommandEcho,
    commandHistory,
  };
};

/**
 * Individual command echo selectors to prevent object recreation
 */
export const useLastCommandEcho = () =>
  useXBeeStore(xbeeSelectors.lastCommandEcho);
export const useCommandHistory = () =>
  useXBeeStore(xbeeSelectors.commandEchoHistory);

/**
 * Hook for log entries with optimized selectors
 */
export const useLogEntries = () => {
  const logEntries = useXBeeStore(xbeeSelectors.logEntries);
  const recentLogs = useXBeeStore(xbeeSelectors.recentLogs);

  return {
    logEntries,
    recentLogs,
  };
};

/**
 * Individual log selectors to prevent object recreation
 */
export const useLogEntriesData = () => useXBeeStore(xbeeSelectors.logEntries);
export const useRecentLogs = () => useXBeeStore(xbeeSelectors.recentLogs);

/**
 * Hook for frame processing statistics
 */
export const useFrameProcessing = () => {
  const processingStats = useXBeeStore(xbeeSelectors.processingStats);
  const frameStats = useXBeeStore(xbeeSelectors.frameStats);

  return {
    ...processingStats,
    ...frameStats,
    clearStats: useXBeeStore((state) => state.resetProcessingStats),
  };
};

/**
 * Hook for activity log data
 */
export const useActivityLog = () => {
  const activityLog = useXBeeStore(xbeeSelectors.activityLog);

  return {
    activityLog,
    recentActivity: activityLog.slice(0, 50),
    clearLog: useXBeeStore((state) => state.clearActivityLog),
  };
};

/**
 * Individual activity log selectors to prevent object recreation
 */
export const useActivityLogData = () => useXBeeStore(xbeeSelectors.activityLog);
export const useRecentActivity = () => {
  const activityLog = useXBeeStore(xbeeSelectors.activityLog);
  return activityLog.slice(0, 50);
};
export const useClearActivityLog = () =>
  useXBeeStore((state) => state.clearActivityLog);

/**
 * Hook for connection actions (for settings and control)
 */
export const useConnectionActions = () => {
  const scanPorts = useXBeeStore((state) => state.scanPorts);
  const connect = useXBeeStore((state) => state.connect);
  const disconnect = useXBeeStore((state) => state.disconnect);
  const transmit = useXBeeStore((state) => state.transmit);
  const setSelectedPort = useXBeeStore((state) => state.setSelectedPort);

  return {
    scanPorts,
    connect,
    disconnect,
    transmit,
    setSelectedPort,
  };
};

/**
 * Individual action selectors to prevent object recreation
 */
export const useScanPorts = () => useXBeeStore((state) => state.scanPorts);
export const useConnect = () => useXBeeStore((state) => state.connect);
export const useDisconnect = () => useXBeeStore((state) => state.disconnect);
export const useTransmit = () => useXBeeStore((state) => state.transmit);
export const useSetSelectedPort = () =>
  useXBeeStore((state) => state.setSelectedPort);
