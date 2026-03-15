import type { ITelemetryType } from "../types/telemetry";
import type { ICanSatTelemetryData } from "../data/csv-data";
import { SENSOR_CONFIG } from "../constants";

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

export const getLatestTelemetryEntries = (
  data: ITelemetryType[],
  count: number = 100
): ITelemetryType[] => {
  return data.slice(0, Math.min(count, data.length));
};

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

// Compute VOC PPM using firmware's pre-calculated ethanol value,
// falling back to a raw ADC heuristic.
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

// Derive individual gas estimates from ethanol baseline using MICS-5524
// sensitivity ratios (approximate, from datasheet).
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

// RAM usage: (1MB - free) / 1MB * 100
export const computeRAMUsagePercent = (freeRamBytes?: number): number => {
  if (freeRamBytes === undefined || freeRamBytes < 0) return 0;
  const totalRAM = 1048576; // 1MB in bytes
  const usedRAM = totalRAM - freeRamBytes;
  return Math.min(100, Math.max(0, (usedRAM / totalRAM) * 100));
};

// Convert RSSI dBm to signal quality percentage (-120 dBm = 0%, -30 dBm = 100%)
export const computeSignalQuality = (rssiDbm: number): number => {
  if (rssiDbm > 1000000000) return 0; // Invalid RSSI indicator
  if (rssiDbm >= -30) return 100;
  if (rssiDbm <= -120) return 0;
  return Math.round(((rssiDbm + 120) / 90) * 100);
};

export const formatMissionTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

// Convert MICS-5524 ADC readings to gas PPM via Rs/R0 curves.
// Falls back to ethanol-derived multipliers when calibration is unavailable.
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
