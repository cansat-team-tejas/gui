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

// Telemetry processing constants
export const TELEMETRY_CONSTANTS = {
  CSV_FIELD_COUNT: 41,
  MAX_HISTORY_SIZE: 1000,
  DATA_RATE_TARGET: 10,
  MAX_BUFFER_SIZE: 5000,
} as const;

// Flight state mappings
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

// Ground Station Commands (matches firmware GS_COMMANDS)
export const GS_COMMANDS = {
  START_TELEMETRY: "START_TX",
  STOP_TELEMETRY: "STOP_TX",
  STATUS: "STATUS",
  CALIBRATE_SENSORS: "CAL_SENSORS",
  CALIBRATE_GYRO: "CAL_GYRO",
  CALIBRATE_BARO: "CAL_BARO",
  CALIBRATE_ACCEL: "CAL_ACCEL",
  RESET_SYSTEM: "RESET",
  RESET_CONFIRM: "RESET_CONFIRM",
  EMERGENCY: "EMERGENCY",
  DEPLOY_SECONDARY: "DEPLOY_SECONDARY",
  START: "START",
  SHUTDOWN: "SHUTDOWN",
  QNH: "QNH:",
  SD_CLEAN: "SD_CLEAN",
  SD_INFO: "SD_INFO",
  SD_LIST: "SD_LIST",
  SD_DIR_INFO: "SD_DIR_INFO:",
  SD_DIR_DELETE: "SD_DIR_DELETE:",
  XBEE_RESET: "XBEE_RESET",
  XBEE_HW_RESET: "XBEE_HW_RESET",
  GPS_RESET: "GPS_RESET",
  AIR_QUALITY_CAL: "AIR_QUALITY_CAL",
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
}
