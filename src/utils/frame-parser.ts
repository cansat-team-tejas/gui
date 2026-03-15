import {
  TelemetryData,
  ParsedFrame,
  CommandEcho,
  LogEntry,
} from "../types/telemetry";
import { FRAME_TYPES, TELEMETRY_CONSTANTS } from "../constants";

export class FrameParser {
  private static readonly CSV_FIELD_COUNT = TELEMETRY_CONSTANTS.CSV_FIELD_COUNT;
  private static readonly LOG_PATTERN = /LOG:\[(\d+)\s+([^\]]+)\]/g;
  private static readonly CMD_ECHO_PATTERN = /CMD_ECHO:([^:]+):(.+)/;

  static parseFrame(frameData: string): ParsedFrame {
    const timestamp = new Date();
    const trimmedData = frameData.trim();

    // Handle standalone command echoes (CMD_ECHO:...)
    if (trimmedData.startsWith("CMD_ECHO:")) {
      return {
        type: FRAME_TYPES.COMMAND_ECHO,
        timestamp,
        data: this.parseCommandEcho(trimmedData),
        raw: frameData,
      };
    }

    // Handle standalone log entries (LOG:...)
    if (trimmedData.startsWith("LOG:")) {
      return {
        type: FRAME_TYPES.LOG_ENTRY,
        timestamp,
        data: this.parseLogEntry(trimmedData),
        raw: frameData,
      };
    }

    // Handle standalone commands (START, CAL_SENSORS, etc.)
    if (!trimmedData.includes(",") && trimmedData.length < 50) {
      return {
        type: FRAME_TYPES.COMMAND_ECHO,
        timestamp,
        data: {
          TEAM_ID: "046",
          MISSION_TIME: "",
          COMMAND_ECHO: `COMMAND:${trimmedData}`,
          timestamp,
        },
        raw: frameData,
      };
    }

    // Handle telemetry data (CSV format)
    return {
      type: FRAME_TYPES.TELEMETRY,
      timestamp,
      data: this.parseTelemetryData(trimmedData),
      raw: frameData,
    };
  }

  private static parseTelemetryData(csvData: string): TelemetryData | null {
    try {
      // Remove any trailing array-like payloads (e.g., log events appended)
      const cleanCsv = csvData.split(",[")[0];
      const fields = cleanCsv.split(",");

      if (fields.length < this.CSV_FIELD_COUNT) {
        console.warn(
          `Incomplete telemetry data: expected ${this.CSV_FIELD_COUNT} fields, got ${fields.length}`
        );
      }

      const parseFloat = (value: string, fallback: number = 0): number => {
        const parsed = Number(value);
        return isNaN(parsed) ? fallback : parsed;
      };

      const parseString = (value: string, fallback: string = ""): string => {
        return value ? value.trim() : fallback;
      };

      // Map fields exactly to the 35-field firmware CSV format
      const TELEMETRY_DATA: TelemetryData = {
        // Header and counters
        TEAM_ID: parseString(fields[0], "046"), // %s
        MISSION_TIME_S: parseFloat(fields[1]), // %.1f
        PACKET_COUNT: parseFloat(fields[2]), // %u

        // Environmental
        ALTITUDE: parseFloat(fields[3]), // %.1f
        PRESSURE: parseFloat(fields[4]), // %.0f
        TEMPERATURE: parseFloat(fields[5]), // %.1f
        VOLTAGE: parseFloat(fields[6]), // %.2f

        // GNSS
        GNSS_TIME: parseString(fields[7]), // %s
        LATITUDE: parseFloat(fields[8]), // %.6f
        LONGITUDE: parseFloat(fields[9]), // %.6f
        GPS_ALTITUDE: parseFloat(fields[10]), // %.1f
        SATELLITES: parseFloat(fields[11]), // %d

        // IMU: accel
        ACCEL_X: parseFloat(fields[12]), // %.2f
        ACCEL_Y: parseFloat(fields[13]), // %.2f
        ACCEL_Z: parseFloat(fields[14]), // %.2f

        // Spin/flight
        GYRO_SPIN_RATE: parseFloat(fields[15]), // %.2f
        FLIGHT_STATE: parseFloat(fields[16]), // %d

        // IMU: gyro
        GYRO_X: parseFloat(fields[17]), // %.2f
        GYRO_Y: parseFloat(fields[18]), // %.2f
        GYRO_Z: parseFloat(fields[19]), // %.2f

        // Orientation
        ROLL: parseFloat(fields[20]), // %.1f
        PITCH: parseFloat(fields[21]), // %.1f
        YAW: parseFloat(fields[22]), // %.1f

        // Magnetometer
        MAG_X: parseFloat(fields[23]), // %.1f
        MAG_Y: parseFloat(fields[24]), // %.1f
        MAG_Z: parseFloat(fields[25]), // %.1f

        // Env/power
        HUMIDITY: parseFloat(fields[26]), // %.2f
        CURRENT: parseFloat(fields[27]), // %.2f
        POWER: parseFloat(fields[28]), // %.1f
        BARO_ALTITUDE: parseFloat(fields[29]), // %.1f
        MCU_TEMP_C: parseFloat(fields[30]), // %.1f

        // Radio/time
        RSSI_DBM: parseFloat(fields[31]), // %d
        RTC_EPOCH: parseFloat(fields[32]), // %lu

        // Strings
        CMD_ECHO: parseString(fields[33] || ""), // %s
        LOG_DATA: parseString(fields[34] || ""), // %s
      } as TelemetryData;

      return TELEMETRY_DATA;
    } catch (error) {
      console.error("Failed to parse telemetry data:", error, csvData);
      return null;
    }
  }

  private static parseCommandEcho(data: string): CommandEcho {
    const match = data.match(this.CMD_ECHO_PATTERN);
    if (!match) {
      return {
        TEAM_ID: "046",
        MISSION_TIME: "",
        COMMAND_ECHO: data,
        timestamp: new Date(),
      };
    }

    const [, command, response] = match;

    return {
      TEAM_ID: "046", // Default team ID
      MISSION_TIME: "", // Will be filled from context if available
      COMMAND_ECHO: `${command}:${response}`,
      timestamp: new Date(),
    };
  }

  /**
   * Parse log entries with timestamps
   */
  private static parseLogEntry(data: string): LogEntry {
    const events: Array<{ time: number; symbol: string }> = [];
    let match;

    while ((match = this.LOG_PATTERN.exec(data)) !== null) {
      events.push({
        time: parseInt(match[1]),
        symbol: match[2].trim(),
      });
    }

    return {
      TEAM_ID: "046", // Default team ID
      MISSION_TIME: "", // Will be filled from context if available
      MESSAGE: data.replace("LOG:", ""),
      timestamp: new Date(),
    };
  }
}
