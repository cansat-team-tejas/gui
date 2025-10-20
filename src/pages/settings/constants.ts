/**
 * Settings page constants
 */
import type { Command } from "./types";

export const SYSTEM_CONTROL_COMMANDS: Command[] = [
  { label: "START TX", command: "START_TX" },
  { label: "STOP TX", command: "STOP_TX" },
  { label: "STATUS", command: "STATUS" },
  { label: "CAL SENSORS", command: "CAL_SENSORS" },
  { label: "RESET", command: "RESET" },
  { label: "START", command: "START" },
  { label: "SHUTDOWN", command: "SHUTDOWN" },
  { label: "SD CLEAN", command: "SD_CLEAN" },
  { label: "SD INFO", command: "SD_INFO" },
];

export const EMERGENCY_COMMANDS: Command[] = [
  { label: "EMERGENCY", command: "EMERGENCY" },
];

export const COMMUNICATION_COMMANDS: Command[] = [
  { label: "COMM STATUS", command: "COMM_STATUS" },
];

export const FLIGHT_CONTROL_COMMANDS: Command[] = [
  { label: "LANDER STAGE1", command: "LANDER_STAGE1" },
  { label: "LANDER STAGE2", command: "LANDER_STAGE2" },
  { label: "SECONDARY DEPLOY", command: "SECONDARY_DEPLOY" },
];

export const RTC_TIME_COMMANDS: Command[] = [
  { label: "GET TIME", command: "GET_TIME" },
  { label: "SET TIME", command: "SET_TIME:" },
  { label: "RTC STATUS", command: "RTC_STATUS" },
  { label: "SET MISSION START", command: "SET_MISSION_START" },
];

export const MCU_MONITORING_COMMANDS: Command[] = [
  { label: "MCU STATUS", command: "MCU_STATUS" },
];

export const TIMEOUTS = {
  RESET_CONFIRM: 10000, // 10 seconds
  CONFIRMATION_TIMEOUT_MS: 30000, // 30 seconds
} as const;

export const CRITICAL_COMMANDS = [
  "EMERGENCY",
  "SHUTDOWN",
  "LANDER_STAGE1",
  "LANDER_STAGE2",
  "SECONDARY_DEPLOY",
  "START",
  "RESET",
] as const;
