import { useMemo } from "react";
import { useXBeeStore, xbeeSelectors } from "../../../store/xbee";
import { useTelemetryLatest } from "../../../hooks/use-xbee";
import { getSafeTelemetryData } from "../../../utils/telemetry-helpers";

export interface MissionContext {
  isConnected: boolean;
  telemetry: {
    altitude: number;
    gpsAltitude: number;
    temperature: number;
    pressure: number;
    humidity: number;
    voltage: number;
    coordinates: {
      lat: number;
      lon: number;
    };
    satellites: number;
    missionTime: number;
  };
  recentCommands: any[];
  recentLogs: any[];
  systemStatus: {
    rssi: number;
    airQuality: number;
  };
}

export const useMissionContext = (): MissionContext => {
  const isConnected = useXBeeStore(xbeeSelectors.isConnected);
  const latestTelemetry = useTelemetryLatest();

  // Use existing selectors to prevent unnecessary re-renders
  const allCommandHistory = useXBeeStore(xbeeSelectors.commandEchoHistory);
  const allLogEntries = useXBeeStore(xbeeSelectors.logEntries);

  // Slice the arrays with memoization
  const commandHistory = useMemo(
    () => allCommandHistory.slice(0, 5),
    [allCommandHistory]
  );
  const logEntries = useMemo(() => allLogEntries.slice(0, 10), [allLogEntries]);

  const telemetryData = useMemo(
    () => getSafeTelemetryData(latestTelemetry),
    [latestTelemetry]
  );

  return useMemo(
    () => ({
      isConnected,
      telemetry: {
        altitude: telemetryData.ALTITUDE,
        gpsAltitude: telemetryData.GNSS_ALTITUDE || 0,
        temperature: telemetryData.TEMPERATURE || 0,
        pressure: telemetryData.PRESSURE,
        humidity: telemetryData.HUMIDITY,
        voltage: telemetryData.VOLTAGE,
        coordinates: {
          lat: telemetryData.GNSS_LATITUDE,
          lon: telemetryData.GNSS_LONGITUDE,
        },
        satellites: telemetryData.GNSS_SATS,
        missionTime: telemetryData.MISSION_TIME_S,
      },
      recentCommands: commandHistory,
      recentLogs: logEntries,
      systemStatus: {
        rssi: telemetryData.RSSI_DBM || 0,
        airQuality: telemetryData.AIR_QUALITY_PPM || 0,
      },
    }),
    [isConnected, telemetryData, commandHistory, logEntries]
  );
};
