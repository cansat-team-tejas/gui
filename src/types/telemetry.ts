/**
 * Telemetry data type definitions
 */
import type { FrameType } from "../constants";

// Basic telemetry data interface - matches the actual CSV data format
export interface ITelemetryType {
  TEAM_ID: string;
  MISSION_TIME_S: number;
  PACKET_COUNT: number;
  ALTITUDE: number;
  PRESSURE: number;
  TEMP: number;
  VOLTAGE: number;
  LATITUDE: number;
  LONGITUDE: number;
  GPS_ALTITUDE: number;
  SATELLITES: number;
  ACCEL_X: number;
  ACCEL_Y: number;
  ACCEL_Z: number;
  GYRO_X: number;
  GYRO_Y: number;
  GYRO_Z: number;
  ROLL: number;
  PITCH: number;
  YAW: number;
  GYRO_SPIN: number;
  FLIGHT_STATE: number;
  CURRENT: number;
  POWER: number;
  MAG_X: number;
  MAG_Y: number;
  MAG_Z: number;
  HUMIDITY: number;
  AIR_QUALITY_RAW: number;
  AIR_QUALITY_PPM: number;
  BARO_ALTITUDE: number;
  RSSI_DBM: number;
  CMD_ECHO: string;
  LOG_DATA: string;
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
