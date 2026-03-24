import type { FrameType } from "../constants";

export interface ITelemetryType {
  TEAM_ID: string;
  MISSION_TIME_S: number;
  PACKET_COUNT: number;
  ALTITUDE: number;
  PRESSURE: number;
  TEMPERATURE: number;
  VOLTAGE: number;
  GNSS_TIME: string;
  LATITUDE: number;
  LONGITUDE: number;
  GPS_ALTITUDE: number;
  SATELLITES: number;
  ACCEL_X: number;
  ACCEL_Y: number;
  ACCEL_Z: number;
  GYRO_SPIN_RATE: number;
  FLIGHT_STATE: number;
  GYRO_X: number;
  GYRO_Y: number;
  GYRO_Z: number;
  ROLL: number;
  PITCH: number;
  YAW: number;
  MAG_X: number;
  MAG_Y: number;
  MAG_Z: number;
  HUMIDITY: number;
  CURRENT: number;
  POWER: number;
  BARO_ALTITUDE: number;
  MCU_TEMP_C: number;
  RSSI_DBM: number;
  RTC_EPOCH: number;
  CMD_ECHO: string;
  LOG_DATA: string;
  [key: string]: any;
}

export interface ICommandType {
  TEAM_ID: string;
  MISSION_TIME: string;
  COMMAND_ECHO: string;
  timestamp: Date;
}

export interface ILogEntryType {
  TEAM_ID: string;
  MISSION_TIME: string;
  MESSAGE: string;
  timestamp: Date;
}

// Frame processing type
export interface ParsedFrame {
  type: FrameType;
  timestamp: Date;
  data: any;
  raw: string;
}
