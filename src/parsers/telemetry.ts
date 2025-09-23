import { TELEMETRY_CONSTANTS } from "../constants";
import { validateTelemetryData } from "../validation/telemetry";
import type { TelemetryDataType } from "../validation/telemetry";

/**
 * Modular telemetry data parser
 * Handles CSV parsing with validation
 */
export class TelemetryParser {
  private static readonly CSV_FIELD_COUNT = TELEMETRY_CONSTANTS.CSV_FIELD_COUNT;

  /**
   * Parse CSV telemetry data efficiently with validation
   */
  static parseTelemetryData(csvData: string): TelemetryDataType | null {
    try {
      // Remove any trailing LOG entries from the CSV line
      const cleanCsv = csvData.split(",[")[0]; // Split at LOG pattern
      const fields = cleanCsv.split(",");

      if (fields.length < this.CSV_FIELD_COUNT) {
        console.warn(
          `Incomplete telemetry data: expected ${this.CSV_FIELD_COUNT} fields, got ${fields.length}`
        );
      }

      // Parse fields efficiently with fallback values
      const parseFloat = (value: string, fallback: number = 0): number => {
        const parsed = Number(value);
        return isNaN(parsed) ? fallback : parsed;
      };

      const parseString = (value: string, fallback: string = ""): string => {
        return value ? value.trim() : fallback;
      };

      const telemetryData = {
        // Core identifiers and timing
        teamId: parseString(fields[0], "UNKNOWN"),
        missionTime: parseFloat(fields[1]),
        packetCount: parseFloat(fields[2]),

        // Environmental sensors
        altitude: parseFloat(fields[3]),
        pressure: parseFloat(fields[4]),
        temperature: parseFloat(fields[5]),
        voltage: parseFloat(fields[6]),

        // GPS data
        latitude: parseFloat(fields[7]),
        longitude: parseFloat(fields[8]),
        gpsAltitude: parseFloat(fields[9]),
        satellites: parseFloat(fields[10]),

        // Accelerometer data
        accelX: parseFloat(fields[11]),
        accelY: parseFloat(fields[12]),
        accelZ: parseFloat(fields[13]),

        // Gyroscope data
        gyroX: parseFloat(fields[14]),
        gyroY: parseFloat(fields[15]),
        gyroZ: parseFloat(fields[16]),

        // Orientation data
        roll: parseFloat(fields[17]),
        pitch: parseFloat(fields[18]),
        yaw: parseFloat(fields[19]),

        // Flight dynamics
        gyroSpinRate: parseFloat(fields[20]),
        flightState: parseFloat(fields[21]),

        // Power systems
        current: parseFloat(fields[22]),
        power: parseFloat(fields[23]),

        // Magnetometer data
        magX: parseFloat(fields[24]),
        magY: parseFloat(fields[25]),
        magZ: parseFloat(fields[26]),

        // Environmental sensors (additional)
        humidity: parseFloat(fields[27]),
        airQualityRaw: parseFloat(fields[28]),
        airQualityPpm: parseFloat(fields[29]),
        baroAltitude: parseFloat(fields[30]),
        rssiDbm: parseFloat(fields[31]),

        // Communication data
        cmdEcho: parseString(fields[32]),
        logData: parseString(fields[33]),
      };

      // Validate the parsed data with Zod
      const validation = validateTelemetryData(telemetryData);

      if (!validation.isValid) {
        console.warn("Telemetry validation failed:", validation.errors);
        // Log validation errors but still return data for debugging
        return telemetryData as TelemetryDataType;
      }

      return validation.data;
    } catch (error) {
      console.error("Failed to parse telemetry data:", error, csvData);
      return null;
    }
  }
}
