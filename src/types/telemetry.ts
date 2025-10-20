/**
 * Telemetry data type definitions
 */
import type { FrameType } from "../constants";

// Basic telemetry data interface - matches the C++ telemetry format exactly
export interface ITelemetryType {
  // 29 fields total based on C++ sprintf format
  TEAM_ID: string; // %s - team ID
  MISSION_TIME_S: number; // %.1f - mission time in seconds
  PACKET_COUNT: number; // %u - packet count
  ALTITUDE: number; // %.1f - barometric altitude
  PRESSURE: number; // %.0f - pressure
  TEMPERATURE: number; // %.1f - temperature
  VOLTAGE: number; // %.2f - voltage
  GNSS_TIME: string; // %s - GNSS time string
  LATITUDE: number; // %.6f - latitude
  LONGITUDE: number; // %.6f - longitude
  GPS_ALTITUDE: number; // %.1f - GPS altitude
  SATELLITES: number; // %d - satellite count
  ACCEL_X: number; // %.2f - acceleration X
  ACCEL_Y: number; // %.2f - acceleration Y
  ACCEL_Z: number; // %.2f - acceleration Z
  GYRO_SPIN_RATE: number; // %.2f - gyroscope spin rate
  FLIGHT_STATE: number; // %d - flight state
  GYRO_X: number; // %.2f - gyroscope X
  GYRO_Y: number; // %.2f - gyroscope Y
  GYRO_Z: number; // %.2f - gyroscope Z
  ROLL: number; // %.1f - roll angle
  PITCH: number; // %.1f - pitch angle
  YAW: number; // %.1f - yaw angle
  MAG_X: number; // %.1f - magnetometer X
  MAG_Y: number; // %.1f - magnetometer Y
  MAG_Z: number; // %.1f - magnetometer Z
  HUMIDITY: number; // %.2f - humidity
  CURRENT: number; // %.2f - current
  POWER: number; // %.1f - power
  BARO_ALTITUDE: number; // %.1f - barometric altitude (duplicate)
  MCU_TEMP_C: number; // %.1f - MCU temperature
  RSSI_DBM: number; // %d - RSSI in dBm
  RTC_EPOCH: number; // %lu - RTC epoch timestamp
  CMD_ECHO: string; // %s - command echo
  LOG_DATA: string; // %s - log data codes

  [key: string]: any; // Allow additional properties
}

// Basic command echo interface
export interface ICommandType {
  TEAM_ID: string;
  MISSION_TIME: string;
  COMMAND_ECHO: string;
  timestamp: Date;
}

// Basic log entry interface
export interface ILogEntryType {
  TEAM_ID: string;
  MISSION_TIME: string;
  MESSAGE: string;
  timestamp: Date;
}

// Export aliases for compatibility
export type TelemetryData = ITelemetryType;
export type CommandEcho = ICommandType;
export type LogEntry = ILogEntryType;

export interface ParsedFrame {
  type: FrameType;
  timestamp: Date;
  data: any;
  raw: string;
}

export interface TelemetryState {
  latest: ITelemetryType;
  history: ITelemetryType[];
  lastUpdate: Date | null;
  packetsReceived: number;
  dataRate: number; // packets per second
  missionStartTime: Date | null;
  totalMissionTime: number; // in seconds
}
