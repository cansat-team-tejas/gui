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
];

export const CALIBRATION_COMMANDS: Command[] = [
  { label: "CAL ALL", command: "CAL_SENSORS" },
];

export const FLIGHT_CONTROL_COMMANDS: Command[] = [
  { label: "PARACHUTE DEPLOY", command: "PARACHUTE_DEPLOY" },
];

export const REACTION_WHEEL_COMMANDS: Command[] = [
  { label: "ARM RW", command: "ARM_RW" },
  { label: "DISARM RW", command: "DISARM_RW" },
  { label: "STOP RW", command: "STOP_RW" },
  { label: "RW STATUS", command: "RW_STATUS" },
];

export const RTC_TIME_COMMANDS: Command[] = [
  { label: "GET TIME", command: "GET_TIME" },
  { label: "RTC STATUS", command: "RTC_STATUS" },
  { label: "SET MISSION START", command: "SET_MISSION_START" },
];

export const MCU_MONITORING_COMMANDS: Command[] = [
  { label: "MCU STATUS", command: "MCU_STATUS" },
  { label: "COMM STATUS", command: "COMM_STATUS" },
];

export const HARDWARE_RESET_COMMANDS: Command[] = [
  { label: "XBEE RESET", command: "XBEE_RESET" },
];

export const SD_CARD_COMMANDS: Command[] = [
  { label: "SD CLEAN", command: "SD_CLEAN" },
  { label: "SD INFO", command: "SD_INFO" },
  { label: "SD LIST", command: "SD_LIST" },
];

export const TIMEOUTS = {
  RESET_CONFIRM: 10000, // 10 seconds
  CONFIRMATION_TIMEOUT_MS: 30000, // 30 seconds
} as const;

export const CRITICAL_COMMANDS = [
  "EMERGENCY",
  "SHUTDOWN",
  "PARACHUTE_DEPLOY",
  "START",
  "RESET",
] as const;
