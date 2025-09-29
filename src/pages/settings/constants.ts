/**
 * Settings page constants
 */
import type { Command } from "./types";

export const SYSTEM_CONTROL_COMMANDS: Command[] = [
  { label: "START TX", command: "START_TX" },
  { label: "STOP TX", command: "STOP_TX" },
  { label: "STATUS", command: "STATUS" },
  { label: "START", command: "START" },
  { label: "SHUTDOWN", command: "SHUTDOWN" },
  { label: "RESET", command: "RESET" },
];

export const EMERGENCY_COMMANDS: Command[] = [
  { label: "EMERGENCY", command: "EMERGENCY" },
  { label: "RESET CONFIRM", command: "RESET_CONFIRM" },
];

export const CALIBRATION_COMMANDS: Command[] = [
  { label: "CAL ALL", command: "CAL_SENSORS" },
  { label: "CAL GYRO", command: "CAL_GYRO" },
  { label: "CAL BARO", command: "CAL_BARO" },
  { label: "CAL ACCEL", command: "CAL_ACCEL" },
];

export const FLIGHT_CONTROL_COMMANDS: Command[] = [
  { label: "DEPLOY SEC", command: "DEPLOY_SECONDARY" },
];

export const SD_CARD_COMMANDS: Command[] = [
  { label: "SD CLEAN", command: "SD_CLEAN" },
  { label: "SD INFO", command: "SD_INFO" },
  { label: "SD LIST", command: "SD_LIST" },
];

export const QNH_DEFAULTS = {
  DEFAULT_VALUE: "1013.25",
  MIN_VALUE: 900,
  MAX_VALUE: 1100,
  STEP: 0.01,
} as const;

export const TIMEOUTS = {
  RESET_CONFIRM: 10000, // 10 seconds
} as const;
