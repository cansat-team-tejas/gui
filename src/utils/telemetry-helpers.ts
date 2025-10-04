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
    TEAM_ID: telemetry.TEAM_ID || "046",
    MISSION_TIME_S: telemetry.MISSION_TIME_S || 0,
    PACKET_COUNT: telemetry.PACKET_COUNT || 0,
    ALTITUDE: telemetry.ALTITUDE || 0,
    PRESSURE: telemetry.PRESSURE || 0,
    TEMPERATURE: telemetry.TEMPERATURE || 0,
    VOLTAGE: telemetry.VOLTAGE || 0,
    GNSS_TIME: telemetry.GNSS_TIME || "",
    GNSS_LATITUDE: telemetry.GNSS_LATITUDE || 0,
    GNSS_LONGITUDE: telemetry.GNSS_LONGITUDE || 0,
    GNSS_ALTITUDE: telemetry.GNSS_ALTITUDE || 0,
    GNSS_SATS: telemetry.GNSS_SATS || 0,
    ACCEL_X: telemetry.ACCEL_X || 0,
    ACCEL_Y: telemetry.ACCEL_Y || 0,
    ACCEL_Z: telemetry.ACCEL_Z || 0,
    GYRO_SPIN_RATE: telemetry.GYRO_SPIN_RATE || 0,
    FLIGHT_STATE: telemetry.FLIGHT_STATE || 0,
    GYRO_X: telemetry.GYRO_X || 0,
    GYRO_Y: telemetry.GYRO_Y || 0,
    GYRO_Z: telemetry.GYRO_Z || 0,
    ROLL: telemetry.ROLL || 0,
    PITCH: telemetry.PITCH || 0,
    YAW: telemetry.YAW || 0,
    MAG_X: telemetry.MAG_X || 0,
    MAG_Y: telemetry.MAG_Y || 0,
    MAG_Z: telemetry.MAG_Z || 0,
    HUMIDITY: telemetry.HUMIDITY || 0,
    CURRENT: telemetry.CURRENT || 0,
    POWER: telemetry.POWER || 0,
    BARO_ALTITUDE: telemetry.BARO_ALTITUDE || 0,
    AIR_QUALITY_RAW: telemetry.AIR_QUALITY_RAW || 0,
    AIR_QUALITY_ETHANOL_PPM:
      telemetry.AIR_QUALITY_ETHANOL_PPM || telemetry.AQ_ETHANOL_PPM || 0,
    MCU_TEMP_C: telemetry.MCU_TEMP_C || 0,
    RSSI_DBM: telemetry.RSSI_DBM || 0,
    HEALTH_FLAGS: telemetry.HEALTH_FLAGS || 0,
    RTC_EPOCH: telemetry.RTC_EPOCH || 0,
    CMD_ECHO: telemetry.CMD_ECHO || "",
    // Derived fields (computed but not in main CSV columns)
    AIR_QUALITY_PPM: telemetry.AIR_QUALITY_PPM || telemetry.VOC_PPM || 0,
    VOC_PPM: telemetry.VOC_PPM || 0,
    CO_PPM: telemetry.CO_PPM || 0,
    CH4_PPM: telemetry.CH4_PPM || 0,
    NH3_PPM: telemetry.NH3_PPM || 0,
    H2_PPM: telemetry.H2_PPM || 0,
    RAM_USAGE_PERCENT: telemetry.RAM_USAGE_PERCENT || 0,
    SIGNAL_QUALITY_PERCENT: telemetry.SIGNAL_QUALITY_PERCENT || 0,
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
      TEMPERATURE: 0,
      VOLTAGE: 0,
      GNSS_TIME: "",
      GNSS_LATITUDE: 0,
      GNSS_LONGITUDE: 0,
      GNSS_ALTITUDE: 0,
      GNSS_SATS: 0,
      ACCEL_X: 0,
      ACCEL_Y: 0,
      ACCEL_Z: 0,
      GYRO_SPIN_RATE: 0,
      FLIGHT_STATE: 0,
      CURRENT: 0,
      POWER: 0,
      GYRO_X: 0,
      GYRO_Y: 0,
      GYRO_Z: 0,
      ROLL: 0,
      PITCH: 0,
      YAW: 0,
      MAG_X: 0,
      MAG_Y: 0,
      MAG_Z: 0,
      HUMIDITY: 0,
      AIR_QUALITY_RAW: 0,
      AIR_QUALITY_PPM: 0,
      BARO_ALTITUDE: 0,
      RSSI_DBM: 0,
      AQ_CO_PPM: 0,
      AQ_CH4_PPM: 0,
      AQ_NH3_PPM: 0,
      AQ_H2_PPM: 0,
      AQ_ETHANOL_PPM: 0,
      MCU_TEMP_C: 0,
      // MCU monitoring fields
      MCU_FREE_RAM: 0,
      MCU_TOTAL_RAM: 0,
      MCU_RAM_USAGE_PERCENT: 0,
      MCU_FREE_FLASH: 0,
      MCU_UPTIME_SECONDS: 0,
      MCU_CPU_FREQUENCY_MHZ: 0,
      MCU_STACK_FREE: 0,
      MCU_CPU_USAGE_PERCENT: 0,
      HEALTH_FLAGS: 0,
      // Timestamp fields
      ISO_TIMESTAMP: "",
      MISSION_TIMESTAMP: "",
      RTC_TIME_VALID: "",
      RTC_MODULE_VALID: 0,
      RTC_LAST_SYNC: 0,
      RTC_EPOCH: 0,
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
