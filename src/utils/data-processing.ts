/**
 * Data Processing Pipeline
 * Centralized data filtering and processing utilities
 */

import type { ITelemetryType } from "../types/telemetry";
import type { ICanSatTelemetryData } from "../data/csv-data";
import { SENSOR_CONFIG } from "../constants";

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
    .map((d) => d.TEMPERATURE)
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
 * Compute VOC PPM from available air quality data.
 *
 * CanSat Telemetry Air Quality Fields:
 * - Field 30 (AIR_QUALITY_RAW): Raw 12-bit ADC value (0-4095) from MICS-5524 on pin A6
 * - Field 31 (AQ_ETHANOL_PPM): Pre-calculated ethanol/VOC concentration (0-500 PPM range)
 *
 * Priority:
 * 1) Use AQ_ETHANOL_PPM from firmware (pre-calculated and smoothed on CanSat)
 * 2) Fallback: Map AIR_QUALITY_RAW to 0-100 ppm as simple heuristic
 *
 * Note: Ethanol PPM is the primary measurement used as baseline for all other gas calculations.
 */
export const computeVocPpm = (
  airQualityRaw?: number,
  ethanolPpm?: number
): number => {
  if (typeof ethanolPpm === "number" && !isNaN(ethanolPpm) && ethanolPpm > 0) {
    return ethanolPpm;
  }
  if (typeof airQualityRaw === "number" && !isNaN(airQualityRaw)) {
    // Raw ADC is 12-bit (0-4095), map to 0-100 ppm as heuristic
    const clamped = Math.max(0, Math.min(airQualityRaw, 4095));
    return parseFloat(((clamped / 4095) * 100).toFixed(1));
  }
  return 0;
};

/**
 * Compute individual gas concentrations from ethanol baseline (MICS-5524 sensor).
 *
 * MICS-5524 Sensor Characteristics:
 * - Single VOC/gas sensor responding to multiple gases
 * - Ethanol is the primary measurement (most sensitive, ±10% accuracy)
 * - Other gases are derived estimates using sensitivity ratios from datasheet
 * - Cross-sensitivity: sensor responds to multiple gases simultaneously
 *
 * Calibration Factors (from MICS-5524 datasheet):
 * - CO (Carbon Monoxide): 0.15 (±30% accuracy, lower sensitivity)
 * - CH4 (Methane): 0.05 (±40% accuracy, lowest sensitivity)
 * - NH3 (Ammonia): 0.08 (±30% accuracy, lower sensitivity)
 * - H2 (Hydrogen): 0.25 (±20% accuracy, moderate sensitivity)
 * - LPG: 0.12 (±30% accuracy, approximate)
 * - Propane: 0.10 (±30% accuracy, approximate)
 *
 * Note: These are approximate estimates. For absolute accuracy,
 * calibrate with known gas concentrations.
 */
export const computeGasConcentrations = (ethanolPpm: number | undefined) => {
  const e =
    typeof ethanolPpm === "number" && !isNaN(ethanolPpm)
      ? Math.max(0, ethanolPpm)
      : 0;
  return {
    AQ_CO_PPM: parseFloat((e * 0.15).toFixed(2)), // Carbon Monoxide
    AQ_CH4_PPM: parseFloat((e * 0.05).toFixed(2)), // Methane
    AQ_NH3_PPM: parseFloat((e * 0.08).toFixed(2)), // Ammonia
    AQ_H2_PPM: parseFloat((e * 0.25).toFixed(2)), // Hydrogen
    AQ_LPG_PPM: parseFloat((e * 0.12).toFixed(2)), // Liquefied Petroleum Gas
    AQ_PROPANE_PPM: parseFloat((e * 0.1).toFixed(2)), // Propane
  } as const;
};

/**
 * Compute RAM usage percentage
 * Per specification: (1048576 - MCU_FREE_RAM) / 1048576 * 100
 */
export const computeRAMUsagePercent = (freeRamBytes?: number): number => {
  if (freeRamBytes === undefined || freeRamBytes < 0) return 0;
  const totalRAM = 1048576; // 1MB in bytes
  const usedRAM = totalRAM - freeRamBytes;
  return Math.min(100, Math.max(0, (usedRAM / totalRAM) * 100));
};

/**
 * Convert RSSI dBm to signal quality percentage
 * Per specification: Convert RSSI_DBM to percentage scale
 * Typical range: -120 dBm (0%) to -30 dBm (100%)
 */
export const computeSignalQuality = (rssiDbm: number): number => {
  if (rssiDbm > 1000000000) return 0; // Invalid RSSI indicator
  if (rssiDbm >= -30) return 100;
  if (rssiDbm <= -120) return 0;
  return Math.round(((rssiDbm + 120) / 90) * 100);
};

/**
 * Format mission time as MM:SS
 * Per specification: Format MISSION_TIME_S as MM:SS
 */
export const formatMissionTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Convert MiCS-5524 sensor readings to ppm, given ADC reading and calibration.
 * Typical approach uses Rs/R0 and log-log curves per gas. If calibration
 * coefficients are not set, falls back to ethanol-derived mix.
 */
export const computeMICS5524Gases = (
  adcRaw: number | undefined,
  vref: number | undefined,
  ethanolPpm: number | undefined
) => {
  // If calibration unknown, fallback to ethanol-based multipliers
  const fallback = () => computeGasConcentrations(ethanolPpm);

  if (
    typeof adcRaw !== "number" ||
    isNaN(adcRaw) ||
    adcRaw <= 0 ||
    SENSOR_CONFIG.TYPE !== "MICS5524"
  ) {
    return fallback();
  }

  const cfg = SENSOR_CONFIG.MICS5524;
  const ADC_MAX = cfg.ADC_MAX;
  const RL = cfg.RL_OHMS;
  const R0 = cfg.R0_OHMS;
  if (!ADC_MAX || !RL || !R0) {
    return fallback();
  }

  // Convert ADC to sensor resistance Rs via voltage divider: V = Vref * (RL / (RL+Rs))
  // Rs = RL * (Vref/V - 1). If Vref not known, assume 3.3V.
  const Vref = typeof vref === "number" && vref > 0 ? vref : 3.3;
  const Vout = (adcRaw / ADC_MAX) * Vref;
  const Rs = Vout > 0 ? RL * (Vref / Vout - 1) : Infinity;
  if (!isFinite(Rs) || Rs <= 0) {
    return fallback();
  }

  const ratio = Rs / R0;
  const apply = (A: number | null, B: number | null): number => {
    if (A == null || B == null) return NaN;
    // ppm = A * (Rs/R0)^B
    return A * Math.pow(ratio, B);
  };

  const { CO, CH4, NH3, H2 } = cfg.COEFFS;
  const co = apply(CO.A, CO.B);
  const ch4 = apply(CH4.A, CH4.B);
  const nh3 = apply(NH3.A, NH3.B);
  const h2 = apply(H2.A, H2.B);

  // If any coefficient missing, fallback entirely to ethanol-based estimation
  if ([co, ch4, nh3, h2].some((v) => isNaN(v))) {
    return fallback();
  }

  return {
    AQ_CO_PPM: parseFloat(Math.max(0, co).toFixed(2)),
    AQ_CH4_PPM: parseFloat(Math.max(0, ch4).toFixed(2)),
    AQ_NH3_PPM: parseFloat(Math.max(0, nh3).toFixed(2)),
    AQ_H2_PPM: parseFloat(Math.max(0, h2).toFixed(2)),
    AQ_LPG_PPM: parseFloat(((ethanolPpm || 0) * 0.12).toFixed(2)),
    AQ_PROPANE_PPM: parseFloat(((ethanolPpm || 0) * 0.1).toFixed(2)),
  } as const;
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

  if (
    typeof data.TEMPERATURE === "number" &&
    (data.TEMPERATURE < -50 || data.TEMPERATURE > 100)
  ) {
    issues.push("Temperature out of expected range");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};
