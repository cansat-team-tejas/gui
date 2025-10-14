/**
 * Telemetry data type definitions
 */
import type { FLIGHT_STATES } from "../constants";

// Basic telemetry data interface - matches the actual CSV data format
export interface ITelemetryType {
  // Required fields from 41-field specification (indices 0-40)
  TEAM_ID: string;
  MISSION_TIME_S: number;
  PACKET_COUNT: number;
  ALTITUDE: number;
  PRESSURE: number;
  TEMPERATURE?: number; // New primary field name
  VOLTAGE: number;
  GNSS_TIME: string;
  GNSS_LATITUDE: number;
  GNSS_LONGITUDE: number;
  GNSS_ALTITUDE: number;
  GNSS_SATS: number;
  ACCEL_X: number;
  ACCEL_Y: number;
  ACCEL_Z: number;
  GYRO_SPIN_RATE: number;
  FLIGHT_STATE?: keyof typeof FLIGHT_STATES; // New primary field name
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
  CURRENT?: number;
  POWER?: number;
  BARO_ALTITUDE?: number;
  AIR_QUALITY_RAW?: number;
  AIR_QUALITY_ETHANOL_PPM?: number; // New primary field name
  MCU_TEMP_C?: number;
  RSSI_DBM?: number;
  HEALTH_FLAGS?: number;
  RTC_EPOCH?: number;
  RW_SPEED_PCT?: number; // Reaction wheel speed percentage
  RW_SATURATED?: number; // Reaction wheel saturated flag (0 or 1)
  YAW_RATE_TARGET?: number; // Target yaw rate for stabilization
  PID_OUTPUT?: number; // PID controller output
  CMD_ECHO?: string;

  // Derived fields (computed on GCS from MICS-5524 sensor data)
  AIR_QUALITY_PPM?: number; // Same as VOC_PPM
  VOC_PPM?: number; // Volatile Organic Compounds (from ethanol PPM)
  CO_PPM?: number; // Carbon Monoxide (derived)
  CH4_PPM?: number; // Methane (derived)
  NH3_PPM?: number; // Ammonia (derived)
  H2_PPM?: number; // Hydrogen (derived)
  LPG_PPM?: number; // Liquefied Petroleum Gas (derived)
  PROPANE_PPM?: number; // Propane (derived)
  RAM_USAGE_PERCENT?: number;
  SIGNAL_QUALITY_PERCENT?: number;

  // Compatibility aliases for existing UI components
  TEMP?: number; // Alias for TEMPERATURE
  FLIGHT_SOFTWARE_STATE?: number; // Alias for FLIGHT_STATE
  AQ_ETHANOL_PPM?: number; // Alias for AIR_QUALITY_ETHANOL_PPM
  LATITUDE?: number; // Computed from GNSS_LATITUDE
  LONGITUDE?: number; // Computed from GNSS_LONGITUDE
  GPS_ALTITUDE?: number; // Alias for GNSS_ALTITUDE
  SATELLITES?: number; // Computed from GNSS_SATS
  GYRO_SPIN?: number; // Computed from GYRO_SPIN_RATE

  // Legacy fields (for backward compatibility with older code)
  AQ_CO_PPM?: number; // Use CO_PPM instead
  AQ_CH4_PPM?: number; // Use CH4_PPM instead
  AQ_NH3_PPM?: number; // Use NH3_PPM instead
  AQ_H2_PPM?: number; // Use H2_PPM instead
  AQ_LPG_PPM?: number; // Liquefied Petroleum Gas
  AQ_PROPANE_PPM?: number; // Propane
  MCU_FREE_RAM?: number;
  MCU_TOTAL_RAM?: number;
  MCU_RAM_USAGE_PERCENT?: number;
  MCU_FREE_FLASH?: number;
  MCU_UPTIME_SECONDS?: number;
  MCU_CPU_FREQUENCY_MHZ?: number;
  MCU_STACK_FREE?: number;
  MCU_CPU_USAGE_PERCENT?: number;
  ISO_TIMESTAMP?: string;
  MISSION_TIMESTAMP?: string;
  RTC_TIME_VALID?: string;
  RTC_MODULE_VALID?: number;
  RTC_LAST_SYNC?: number;
  LOG_DATA?: string;

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

export interface TelemetryState {
  latest: ITelemetryType;
  history: ITelemetryType[];
  lastUpdate: Date | null;
  packetsReceived: number;
  dataRate: number; // packets per second
  missionStartTime: Date | null;
  totalMissionTime: number; // in seconds
}
