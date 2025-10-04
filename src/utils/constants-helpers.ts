/**
 * Utility functions for working with constants
 */

import {
  GS_COMMANDS,
  getHealthStatus,
  MISSION_CONSTANTS,
  type GroundStationCommand,
  type HealthStatus,
} from "../constants";

// Command validation helper
export const isValidGroundStationCommand = (
  command: string
): command is GroundStationCommand => {
  return Object.values(GS_COMMANDS).includes(command as GroundStationCommand);
};

// Health status helpers
export const getHealthPercentage = (healthStatus: HealthStatus): number => {
  const totalChecks = Object.keys(healthStatus).length;
  const passedChecks = Object.values(healthStatus).filter(Boolean).length;
  return Math.round((passedChecks / totalChecks) * 100);
};

export const getHealthSummary = (
  healthFlags: number
): {
  status: HealthStatus;
  percentage: number;
  isHealthy: boolean;
  criticalIssues: string[];
} => {
  const status = getHealthStatus(healthFlags);
  const percentage = getHealthPercentage(status);
  const isHealthy = percentage >= 80; // 80% or higher considered healthy

  const criticalIssues: string[] = [];
  if (!status.communication) criticalIssues.push("Communication");
  if (!status.gps) criticalIssues.push("GPS");
  if (!status.imu) criticalIssues.push("IMU");
  if (!status.power) criticalIssues.push("Power");
  if (!status.rtc) criticalIssues.push("RTC");

  return {
    status,
    percentage,
    isHealthy,
    criticalIssues,
  };
};

// Mission parameter helpers
export const getAltitudeStatus = (currentAltitude: number) => {
  const {
    LAUNCH_DETECTION_ALTITUDE,
    PARACHUTE_DEPLOY_ALTITUDE,
    SECONDARY_DEPLOY_ALTITUDE,
    IMPACT_DETECTION_ALTITUDE,
    MAX_ALTITUDE,
  } = MISSION_CONSTANTS;

  if (currentAltitude < LAUNCH_DETECTION_ALTITUDE) {
    return "ground";
  } else if (currentAltitude < SECONDARY_DEPLOY_ALTITUDE) {
    return "ascending";
  } else if (currentAltitude < PARACHUTE_DEPLOY_ALTITUDE) {
    return "high-altitude";
  } else if (currentAltitude >= MAX_ALTITUDE) {
    return "apogee";
  } else if (currentAltitude > IMPACT_DETECTION_ALTITUDE) {
    return "descending";
  } else {
    return "landed";
  }
};

export const shouldDeployParachute = (
  altitude: number
): "main" | "secondary" | null => {
  if (
    altitude <= MISSION_CONSTANTS.PARACHUTE_DEPLOY_ALTITUDE &&
    altitude > MISSION_CONSTANTS.SECONDARY_DEPLOY_ALTITUDE
  ) {
    return "main";
  } else if (
    altitude <= MISSION_CONSTANTS.SECONDARY_DEPLOY_ALTITUDE &&
    altitude > MISSION_CONSTANTS.IMPACT_DETECTION_ALTITUDE
  ) {
    return "secondary";
  }
  return null;
};

// Command formatting helpers
// Removed unused functions: formatGroundStationCommand, parseCommandResponse
