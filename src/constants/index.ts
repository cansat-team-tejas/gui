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
  CSV_FIELD_COUNT: 34,
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
