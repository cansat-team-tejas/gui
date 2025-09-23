/**
 * Telemetry Data Utilities
 * Centralized functions for telemetry data processing and transformation
 */

import type { ITelemetryType } from "../types/telemetry";
import type { ICanSatTelemetryData } from "../data/csv-data";

/**
 * Transform raw telemetry data to CSV table format
 * Handles property mapping and type conversion consistently
 */
export const transformTelemetryToCSV = (
  telemetryData: ITelemetryType[]
): ICanSatTelemetryData[] => {
  return telemetryData.map((telemetry) => ({
    TEAM_ID: parseInt(telemetry.TEAM_ID) || 0,
    MISSION_TIME_S: telemetry.MISSION_TIME_S || 0,
    PACKET_COUNT: telemetry.PACKET_COUNT || 0,
    ALTITUDE: telemetry.ALTITUDE || 0,
    PRESSURE: telemetry.PRESSURE || 0,
    TEMP: telemetry.TEMP || 0,
    VOLTAGE: telemetry.VOLTAGE || 0,
    LATITUDE: telemetry.LATITUDE || 0,
    LONGITUDE: telemetry.LONGITUDE || 0,
    GPS_ALTITUDE: telemetry.GPS_ALTITUDE || 0,
    SATELLITES: telemetry.SATELLITES || 0,
    ACCEL_X: telemetry.ACCEL_X || 0,
    ACCEL_Y: telemetry.ACCEL_Y || 0,
    ACCEL_Z: telemetry.ACCEL_Z || 0,
    GYRO_X: telemetry.GYRO_X || 0,
    GYRO_Y: telemetry.GYRO_Y || 0,
    GYRO_Z: telemetry.GYRO_Z || 0,
    ROLL: telemetry.ROLL || 0,
    PITCH: telemetry.PITCH || 0,
    YAW: telemetry.YAW || 0,
    GYRO_SPIN: telemetry.GYRO_SPIN || 0,
    FLIGHT_STATE: telemetry.FLIGHT_STATE || 0,
    CURRENT: telemetry.CURRENT || 0,
    POWER: telemetry.POWER || 0,
    MAG_X: telemetry.MAG_X || 0,
    MAG_Y: telemetry.MAG_Y || 0,
    MAG_Z: telemetry.MAG_Z || 0,
    HUMIDITY: telemetry.HUMIDITY || 0,
    AIR_QUALITY_RAW: telemetry.AIR_QUALITY_RAW || 0,
    AIR_QUALITY_PPM: telemetry.AIR_QUALITY_PPM || 0,
    BARO_ALTITUDE: telemetry.BARO_ALTITUDE || 0,
    RSSI_DBM: telemetry.RSSI_DBM || 0,
    CMD_ECHO: telemetry.CMD_ECHO || "",
    LOG_DATA: telemetry.LOG_DATA || "",
  }));
};

/**
 * Get safe telemetry values with fallbacks for UI display
 * Prevents undefined/null values from breaking UI components
 */
export const getSafeTelemetryData = (
  telemetry: ITelemetryType | null
): ITelemetryType => {
  return (
    telemetry || {
      TEAM_ID: "046",
      MISSION_TIME_S: 0,
      PACKET_COUNT: 0,
      ALTITUDE: 0,
      PRESSURE: 0,
      TEMP: 0,
      VOLTAGE: 0,
      LATITUDE: 0,
      LONGITUDE: 0,
      GPS_ALTITUDE: 0,
      SATELLITES: 0,
      ACCEL_X: 0,
      ACCEL_Y: 0,
      ACCEL_Z: 0,
      GYRO_X: 0,
      GYRO_Y: 0,
      GYRO_Z: 0,
      ROLL: 0,
      PITCH: 0,
      YAW: 0,
      GYRO_SPIN: 0,
      FLIGHT_STATE: 0,
      CURRENT: 0,
      POWER: 0,
      MAG_X: 0,
      MAG_Y: 0,
      MAG_Z: 0,
      HUMIDITY: 0,
      AIR_QUALITY_RAW: 0,
      AIR_QUALITY_PPM: 0,
      BARO_ALTITUDE: 0,
      RSSI_DBM: 0,
      CMD_ECHO: "",
      LOG_DATA: "",
    }
  );
};

/**
 * Format telemetry values for display with appropriate precision
 */
export const formatTelemetryValue = (
  value: number,
  precision: number = 1
): string => {
  if (typeof value !== "number" || isNaN(value)) {
    return "0.0";
  }
  return value.toFixed(precision);
};

/**
 * Calculate RSSI signal strength indicator
 */
export const getRSSIStatus = (
  rssi: number
): { color: string; status: string } => {
  if (rssi > -50) {
    return { color: "bg-[#00AD57]", status: "EXCELLENT" };
  } else if (rssi > -70) {
    return { color: "bg-[#FFAB00]", status: "GOOD" };
  } else {
    return { color: "bg-red-500", status: "POOR" };
  }
};
