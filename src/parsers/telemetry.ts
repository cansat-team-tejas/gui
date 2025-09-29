import { TELEMETRY_CONSTANTS } from "../constants";
import type { ITelemetryType } from "../types/telemetry";

/**
 * Modular telemetry data parser
 * Handles CSV parsing for new 41-field telemetry schema
 */
export class TelemetryParser {
  private static readonly CSV_FIELD_COUNT = TELEMETRY_CONSTANTS.CSV_FIELD_COUNT;

  /**
   * Parse CSV telemetry data efficiently with the updated schema
   */
  static parseTelemetryData(csvData: string): ITelemetryType | null {
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

      const telemetryData: ITelemetryType = {
        // Core identifiers and timing
        TEAM_ID: parseString(fields[0], "046"),
        MISSION_TIME_S: parseFloat(fields[1]),
        PACKET_COUNT: parseFloat(fields[2]),

        // Environmental sensors
        ALTITUDE: parseFloat(fields[3]),
        PRESSURE: parseFloat(fields[4]),
        TEMP: parseFloat(fields[5]),
        VOLTAGE: parseFloat(fields[6]),

        // GPS data
        LATITUDE: parseFloat(fields[7]),
        LONGITUDE: parseFloat(fields[8]),
        GPS_ALTITUDE: parseFloat(fields[9]),
        SATELLITES: parseFloat(fields[10]),

        // Accelerometer data
        ACCEL_X: parseFloat(fields[11]),
        ACCEL_Y: parseFloat(fields[12]),
        ACCEL_Z: parseFloat(fields[13]),

        // Gyroscope data
        GYRO_X: parseFloat(fields[14]),
        GYRO_Y: parseFloat(fields[15]),
        GYRO_Z: parseFloat(fields[16]),

        // Orientation data
        ROLL: parseFloat(fields[17]),
        PITCH: parseFloat(fields[18]),
        YAW: parseFloat(fields[19]),

        // Flight dynamics
        GYRO_SPIN: parseFloat(fields[20]),
        FLIGHT_STATE: parseFloat(fields[21]),

        // Power systems
        CURRENT: parseFloat(fields[22]),
        POWER: parseFloat(fields[23]),

        // Magnetometer data
        MAG_X: parseFloat(fields[24]),
        MAG_Y: parseFloat(fields[25]),
        MAG_Z: parseFloat(fields[26]),

        // Environmental sensors (additional)
        HUMIDITY: parseFloat(fields[27]),
        AIR_QUALITY_RAW: parseFloat(fields[28]),
        AIR_QUALITY_PPM: parseFloat(fields[29]),
        BARO_ALTITUDE: parseFloat(fields[30]),
        RSSI_DBM: parseFloat(fields[31]),

        // New air quality gases
        AQ_CO_PPM: parseFloat(fields[32]),
        AQ_CH4_PPM: parseFloat(fields[33]),
        AQ_NH3_PPM: parseFloat(fields[34]),
        AQ_H2_PPM: parseFloat(fields[35]),
        AQ_ETHANOL_PPM: parseFloat(fields[36]),
        MCU_TEMP_C: parseFloat(fields[37]),
        HEALTH_FLAGS: parseFloat(fields[38]),

        // Communication data
        CMD_ECHO: parseString(fields[39]),
        LOG_DATA: parseString(fields[40]),
      };

      return telemetryData;
    } catch (error) {
      console.error("Failed to parse telemetry data:", error, csvData);
      return null;
    }
  }
}
