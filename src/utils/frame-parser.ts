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

    if (trimmedData.startsWith("CMD_ECHO:")) {
      return {
        type: FRAME_TYPES.COMMAND_ECHO,
        timestamp,
        data: this.parseCommandEcho(trimmedData),
        raw: frameData,
      };
    }

    if (trimmedData.startsWith("LOG:")) {
      return {
        type: FRAME_TYPES.LOG_ENTRY,
        timestamp,
        data: this.parseLogEntry(trimmedData),
        raw: frameData,
      };
    }

    // Short non-CSV strings are standalone commands (e.g. START, CAL_SENSORS)
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

    return {
      type: FRAME_TYPES.TELEMETRY,
      timestamp,
      data: this.parseTelemetryData(trimmedData),
      raw: frameData,
    };
  }

  /**
   * Parses a 35-field CSV string matching the firmware's sprintf telemetry format
   * into a structured TelemetryData object.
   */
  private static parseTelemetryData(csvData: string): TelemetryData | null {
    try {
      const cleanCsv = csvData.split(",[")[0];
      const fields = cleanCsv.split(",");

      if (fields.length < this.CSV_FIELD_COUNT) {
        console.warn(
          `Incomplete telemetry: expected ${this.CSV_FIELD_COUNT} fields, got ${fields.length}`
        );
      }

      const num = (value: string, fallback: number = 0): number => {
        const parsed = Number(value);
        return isNaN(parsed) ? fallback : parsed;
      };

      const str = (value: string, fallback: string = ""): string =>
        value ? value.trim() : fallback;

      return {
        TEAM_ID: str(fields[0], "046"),
        MISSION_TIME_S: num(fields[1]),
        PACKET_COUNT: num(fields[2]),
        ALTITUDE: num(fields[3]),
        PRESSURE: num(fields[4]),
        TEMPERATURE: num(fields[5]),
        VOLTAGE: num(fields[6]),
        GNSS_TIME: str(fields[7]),
        LATITUDE: num(fields[8]),
        LONGITUDE: num(fields[9]),
        GPS_ALTITUDE: num(fields[10]),
        SATELLITES: num(fields[11]),
        ACCEL_X: num(fields[12]),
        ACCEL_Y: num(fields[13]),
        ACCEL_Z: num(fields[14]),
        GYRO_SPIN_RATE: num(fields[15]),
        FLIGHT_STATE: num(fields[16]),
        GYRO_X: num(fields[17]),
        GYRO_Y: num(fields[18]),
        GYRO_Z: num(fields[19]),
        ROLL: num(fields[20]),
        PITCH: num(fields[21]),
        YAW: num(fields[22]),
        MAG_X: num(fields[23]),
        MAG_Y: num(fields[24]),
        MAG_Z: num(fields[25]),
        HUMIDITY: num(fields[26]),
        CURRENT: num(fields[27]),
        POWER: num(fields[28]),
        BARO_ALTITUDE: num(fields[29]),
        MCU_TEMP_C: num(fields[30]),
        RSSI_DBM: num(fields[31]),
        RTC_EPOCH: num(fields[32]),
        CMD_ECHO: str(fields[33] || ""),
        LOG_DATA: str(fields[34] || ""),
      } as TelemetryData;
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
      TEAM_ID: "046",
      MISSION_TIME: "",
      COMMAND_ECHO: `${command}:${response}`,
      timestamp: new Date(),
    };
  }

  private static parseLogEntry(data: string): LogEntry {
    let match;
    while ((match = this.LOG_PATTERN.exec(data)) !== null) {
      // Pattern consumed — side-effect advances regex lastIndex
    }

    return {
      TEAM_ID: "046",
      MISSION_TIME: "",
      MESSAGE: data.replace("LOG:", ""),
      timestamp: new Date(),
    };
  }
}
