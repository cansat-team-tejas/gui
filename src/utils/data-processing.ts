/**
 * Data Processing Pipeline
 * Centralized data filtering and processing utilities
 */

import type { ITelemetryType } from "../types/telemetry";
import type { ICanSatTelemetryData } from "../data/csv-data";

/**
 * Filter telemetry data based on search criteria
 */
export const filterTelemetryData = (
  data: ICanSatTelemetryData[],
  searchTerm: string,
  searchColumn: keyof ICanSatTelemetryData
): ICanSatTelemetryData[] => {
  if (!searchTerm.trim()) {
    return data;
  }

  return data.filter((row) => {
    const value = row[searchColumn];
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });
};

/**
 * Sort telemetry data by specified column
 */
export const sortTelemetryData = (
  data: ICanSatTelemetryData[],
  column: keyof ICanSatTelemetryData,
  direction: "asc" | "desc" = "desc"
): ICanSatTelemetryData[] => {
  return [...data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (direction === "asc") {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });
};

/**
 * Get latest N telemetry entries
 */
export const getLatestTelemetryEntries = (
  data: ITelemetryType[],
  count: number = 100
): ITelemetryType[] => {
  return data.slice(0, Math.min(count, data.length));
};

/**
 * Calculate telemetry statistics
 */
export const calculateTelemetryStats = (data: ITelemetryType[]) => {
  if (data.length === 0) {
    return {
      totalEntries: 0,
      averageAltitude: 0,
      maxAltitude: 0,
      minAltitude: 0,
      averageTemperature: 0,
      maxTemperature: 0,
      minTemperature: 0,
      latestPacketCount: 0,
    };
  }

  const altitudes = data
    .map((d) => d.ALTITUDE)
    .filter((a) => typeof a === "number");
  const temperatures = data
    .map((d) => d.TEMP)
    .filter((t) => typeof t === "number");

  return {
    totalEntries: data.length,
    averageAltitude:
      altitudes.length > 0
        ? altitudes.reduce((sum, alt) => sum + alt, 0) / altitudes.length
        : 0,
    maxAltitude: altitudes.length > 0 ? Math.max(...altitudes) : 0,
    minAltitude: altitudes.length > 0 ? Math.min(...altitudes) : 0,
    averageTemperature:
      temperatures.length > 0
        ? temperatures.reduce((sum, temp) => sum + temp, 0) /
          temperatures.length
        : 0,
    maxTemperature: temperatures.length > 0 ? Math.max(...temperatures) : 0,
    minTemperature: temperatures.length > 0 ? Math.min(...temperatures) : 0,
    latestPacketCount: data[0]?.PACKET_COUNT || 0,
  };
};

/**
 * Validate telemetry data integrity
 */
export const validateTelemetryData = (
  data: ITelemetryType
): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check for required fields
  if (!data.TEAM_ID || data.TEAM_ID === "") {
    issues.push("Missing TEAM_ID");
  }

  if (typeof data.MISSION_TIME_S !== "number" || data.MISSION_TIME_S < 0) {
    issues.push("Invalid MISSION_TIME_S");
  }

  if (typeof data.PACKET_COUNT !== "number" || data.PACKET_COUNT < 0) {
    issues.push("Invalid PACKET_COUNT");
  }

  // Check for reasonable value ranges
  if (
    typeof data.ALTITUDE === "number" &&
    (data.ALTITUDE < -1000 || data.ALTITUDE > 50000)
  ) {
    issues.push("Altitude out of expected range");
  }

  if (typeof data.TEMP === "number" && (data.TEMP < -50 || data.TEMP > 100)) {
    issues.push("Temperature out of expected range");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};
