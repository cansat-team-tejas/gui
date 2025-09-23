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

      const TELEMETRY_DATA = {
        TEAM_ID: parseString(fields[0], "046"),
        MISSION_TIME_S: parseFloat(fields[1]),
        PACKET_COUNT: parseFloat(fields[2]),

        // Correct field mapping based on your sequence
        ALTITUDE: parseFloat(fields[3]), // altitude
        PRESSURE: parseFloat(fields[4]), // pressure
        TEMP: parseFloat(fields[5]), // temperature
        VOLTAGE: parseFloat(fields[6]), // voltage

        LATITUDE: parseFloat(fields[7]), // latitude
        LONGITUDE: parseFloat(fields[8]), // longitude
        GPS_ALTITUDE: parseFloat(fields[9]), // gps_altitude
        SATELLITES: parseFloat(fields[10]), // satellites

        ACCEL_X: parseFloat(fields[11]), // accel_x
        ACCEL_Y: parseFloat(fields[12]), // accel_y
        ACCEL_Z: parseFloat(fields[13]), // accel_z

        GYRO_X: parseFloat(fields[14]), // gyro_x
        GYRO_Y: parseFloat(fields[15]), // gyro_y
        GYRO_Z: parseFloat(fields[16]), // gyro_z

        ROLL: parseFloat(fields[17]), // roll
        PITCH: parseFloat(fields[18]), // pitch
        YAW: parseFloat(fields[19]), // yaw

        GYRO_SPIN: parseFloat(fields[20]), // gyro_spin_rate
        FLIGHT_STATE: parseFloat(fields[21]), // flight_controller.get_flight_state()

        CURRENT: parseFloat(fields[22]), // current
        POWER: parseFloat(fields[23]), // power

        MAG_X: parseFloat(fields[24]), // mag_x
        MAG_Y: parseFloat(fields[25]), // mag_y
        MAG_Z: parseFloat(fields[26]), // mag_z

        HUMIDITY: parseFloat(fields[27]), // humidity
        AIR_QUALITY_RAW: parseFloat(fields[28]), // air_quality_raw
        AIR_QUALITY_PPM: parseFloat(fields[29]), // air_quality_ppm
        BARO_ALTITUDE: parseFloat(fields[30]), // baro_altitude
        RSSI_DBM: parseFloat(fields[31]), // rssi_dbm

        CMD_ECHO: parseString(fields[32]), // cmd_echo.c_str()
        LOG_DATA: parseString(fields[33]), // log_data.c_str()
      };

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
