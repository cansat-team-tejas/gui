/**
 * Application-wide constants
 */

// Frame types for telemetry processing
export const FRAME_TYPES = {
  TELEMETRY: "TELEMETRY",
  COMMAND_ECHO: "COMMAND_ECHO",
  LOG_ENTRY: "LOG_ENTRY",
  UNKNOWN: "UNKNOWN",
} as const;

export type FrameType = (typeof FRAME_TYPES)[keyof typeof FRAME_TYPES];

export const TELEMETRY_CONSTANTS = {
  // Matches firmware sprintf format: 35 comma-separated fields
  CSV_FIELD_COUNT: 35,
  MAX_HISTORY_SIZE: 1000,
  DATA_RATE_TARGET: 10, // Hz - matches firmware SENSOR_PROCESS_INTERVAL
  TELEMETRY_INTERVAL: 100, // ms - matches firmware TELEMETRY_DATA_INTERVAL
  LOG_INTERVAL: 5000, // ms - matches firmware LOG_DATA_INTERVAL
  MAX_BUFFER_SIZE: 5000,
} as const;

export const FLIGHT_STATES = {
  0: "BOOT",
  1: "TEST_MODE",
  2: "LAUNCH_PAD",
  3: "ASCENT",
  4: "ROCKET_DEPLOY",
  5: "DESCENT",
  6: "SECONDARY_DEPLOY",
  7: "FINAL_DESCENT",
  8: "IMPACT",
} as const;

// XBee communication constants
export const XBEE_CONSTANTS = {
  DEFAULT_BAUD_RATE: 9600,
  CONNECTION_TIMEOUT: 5000,
  COMMAND_TIMEOUT: 3000,
  MAX_COMMAND_LENGTH: 50,
  RETRY_ATTEMPTS: 3,
} as const;

// XBee Explicit Frame Cluster IDs (matches firmware packet types)
export const CLUSTER_IDS = {
  TELEMETRY: 0x0001,
  LOG: 0x0002,
  CMD_RESPONSE: 0x0003,
} as const;

export type ClusterID = (typeof CLUSTER_IDS)[keyof typeof CLUSTER_IDS];

// Ground Station Commands (matches firmware GS_COMMANDS)
export const GS_COMMANDS = {
  START_TELEMETRY: "START_TX",
  STATUS: "STATUS",
  STOP_TELEMETRY: "STOP_TX",
  CALIBRATE_SENSORS: "CAL_SENSORS",
  RESET_SYSTEM: "RESET",
  EMERGENCY: "EMERGENCY",
  PARACHUTE_DEPLOY: "PARACHUTE_DEPLOY",
  START: "START",
  SHUTDOWN: "SHUTDOWN",
  CLEAR_MISSION: "CLEAR_MISSION",
  SD_CLEAN: "SD_CLEAN",
  SD_INFO: "SD_INFO",
  SD_LIST: "SD_LIST",
  XBEE_RESET: "XBEE_RESET",
  // RTC time management commands
  SET_MISSION_START: "SET_MISSION_START",
  GET_TIME: "GET_TIME",
  SET_TIME: "SET_TIME:",
  RTC_STATUS: "RTC_STATUS",
  // MCU monitoring commands
  MCU_STATUS: "MCU_STATUS",
  // Communication diagnostics
  COMM_STATUS: "COMM_STATUS",
  // Reaction wheel control commands
  ARM_RW: "ARM_RW",
  DISARM_RW: "DISARM_RW",
  STOP_RW: "STOP_RW",
  RW_STATUS: "RW_STATUS",
  SET_RW_SPEED: "SET_RW_SPEED:",
  SET_PID_GAINS: "SET_PID:",
} as const;

// Sensor configurations (used for GCS-side calculations)
// Minimal SENSOR_CONFIG retained for compatibility; not used by current CSV
export const SENSOR_CONFIG = {
  TYPE: "MICS5524" as const,
  MICS5524: {
    ADC_MAX: 4096,
    RL_OHMS: 10000,
    R0_OHMS: 0,
    COEFFS: {
      CO: { A: null as number | null, B: null as number | null },
      CH4: { A: null as number | null, B: null as number | null },
      NH3: { A: null as number | null, B: null as number | null },
      H2: { A: null as number | null, B: null as number | null },
    },
  },
} as const;

// Health Flags (matches firmware HEALTH_FLAGS)
export const HEALTH_FLAGS = {
  ENV_OK: 1 << 0, // Environment/BME280 initialized
  GPS_OK: 1 << 1, // GPS interface initialized
  IMU_OK: 1 << 2, // IMU/BNO055 initialized
  POWER_OK: 1 << 3, // INA219 initialized
  AIR_OK: 1 << 4, // Air quality sensor initialized
  SD_OK: 1 << 5, // SD logger initialized
  COMM_OK: 1 << 6, // XBee comm interface initialized
  RTC_OK: 1 << 7, // RTC interface initialized
} as const;

// Health flag helper functions
export const getHealthStatus = (healthFlags: number) => ({
  environment: !!(healthFlags & HEALTH_FLAGS.ENV_OK),
  gps: !!(healthFlags & HEALTH_FLAGS.GPS_OK),
  imu: !!(healthFlags & HEALTH_FLAGS.IMU_OK),
  power: !!(healthFlags & HEALTH_FLAGS.POWER_OK),
  airQuality: !!(healthFlags & HEALTH_FLAGS.AIR_OK),
  sdCard: !!(healthFlags & HEALTH_FLAGS.SD_OK),
  communication: !!(healthFlags & HEALTH_FLAGS.COMM_OK),
  rtc: !!(healthFlags & HEALTH_FLAGS.RTC_OK),
});

// Mission Parameters (matches firmware CONSTANTS)
export const MISSION_CONSTANTS = {
  TEAM_ID: "046",
  SEA_LEVEL_PRESSURE: 1013.25,
  LAUNCH_DETECTION_ALTITUDE: 20.0,
  IMPACT_DETECTION_ALTITUDE: 5.0,
  PARACHUTE_DEPLOY_ALTITUDE: 1000.0,
  SECONDARY_DEPLOY_ALTITUDE: 500.0,
  MAX_ALTITUDE: 1000.0,
  GROUND_LEVEL_ALTITUDE: 100.0,
} as const;

// Type definitions for better type safety
export type FlightState = keyof typeof FLIGHT_STATES;
export type GroundStationCommand =
  (typeof GS_COMMANDS)[keyof typeof GS_COMMANDS];
export type HealthFlag = (typeof HEALTH_FLAGS)[keyof typeof HEALTH_FLAGS];

// Health status interface
export interface HealthStatus {
  environment: boolean;
  gps: boolean;
  imu: boolean;
  power: boolean;
  airQuality: boolean;
  sdCard: boolean;
  communication: boolean;
  rtc: boolean;
}
