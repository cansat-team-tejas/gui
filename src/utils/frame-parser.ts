import {
  TelemetryData,
  ParsedFrame,
  CommandEcho,
  LogEntry,
} from "../types/telemetry";
import { FRAME_TYPES, TELEMETRY_CONSTANTS } from "../constants";
import {
  computeVocPpm,
  computeGasConcentrations,
  computeMICS5524Gases,
} from "./data-processing";

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

      const TELEMETRY_DATA: any = {
        TEAM_ID: parseString(fields[0], "046"),
        MISSION_TIME_S: parseFloat(fields[1]),
        PACKET_COUNT: parseFloat(fields[2]),

        // Environmental sensors
        ALTITUDE: parseFloat(fields[3]),
        PRESSURE: parseFloat(fields[4]),
        TEMPERATURE: parseFloat(fields[5]), // Corrected field name
        VOLTAGE: parseFloat(fields[6]),

        // GNSS data (new field structure)
        GNSS_TIME: parseString(fields[7]),
        GNSS_LATITUDE: parseFloat(fields[8]),
        GNSS_LONGITUDE: parseFloat(fields[9]),
        GNSS_ALTITUDE: parseFloat(fields[10]),
        GNSS_SATS: parseFloat(fields[11]),

        // Accelerometer data
        ACCEL_X: parseFloat(fields[12]),
        ACCEL_Y: parseFloat(fields[13]),
        ACCEL_Z: parseFloat(fields[14]),

        // Flight dynamics
        GYRO_SPIN_RATE: parseFloat(fields[15]),
        FLIGHT_STATE: parseFloat(fields[16]), // Corrected field name

        // Power systems
        CURRENT: parseFloat(fields[27]),
        POWER: parseFloat(fields[28]),

        // Gyroscope data
        GYRO_X: parseFloat(fields[17]),
        GYRO_Y: parseFloat(fields[18]),
        GYRO_Z: parseFloat(fields[19]),

        // Orientation data
        ROLL: parseFloat(fields[20]),
        PITCH: parseFloat(fields[21]),
        YAW: parseFloat(fields[22]),

        // Magnetometer data
        MAG_X: parseFloat(fields[23]),
        MAG_Y: parseFloat(fields[24]),
        MAG_Z: parseFloat(fields[25]),

        // Environmental sensors (additional)
        HUMIDITY: parseFloat(fields[26]),
        BARO_ALTITUDE: parseFloat(fields[29]),

        // Air Quality Data (MICS-5524 Sensor)
        // Field 30: Raw 12-bit ADC value (0-4095) from pin A6 - for diagnostics
        // Field 31: Pre-calculated ethanol/VOC PPM (0-500 range) - base measurement
        AIR_QUALITY_RAW: parseFloat(fields[30]),
        AQ_ETHANOL_PPM: parseFloat(fields[31]),

        MCU_TEMP_C: parseFloat(fields[32]),
        RSSI_DBM: parseFloat(fields[33]),
        HEALTH_FLAGS: (() => {
          const raw = parseString(fields[34], "0");
          return raw.startsWith("0x") ? parseInt(raw, 16) : Number(raw) || 0;
        })(),
        RTC_EPOCH: parseFloat(fields[35]),

        // Reaction wheel control data (new fields)
        RW_SPEED_PCT: parseFloat(fields[36]),
        RW_SATURATED: parseFloat(fields[37]),
        YAW_RATE_TARGET: parseFloat(fields[38]),
        PID_OUTPUT: parseFloat(fields[39]),

        // Communication data
        CMD_ECHO: parseString(fields[40] || ""),
        LOG_DATA: parseString(fields[41] || ""),
      };

      // ========== Air Quality Gas Calculations (MICS-5524) ==========
      // The MICS-5524 is a single VOC sensor responding to multiple gases.
      // Only 2 values are sent from CanSat:
      //   1. AIR_QUALITY_RAW (Field 30): Raw ADC for diagnostics
      //   2. AQ_ETHANOL_PPM (Field 31): Pre-calculated ethanol/VOC baseline
      //
      // GUI derives other gas concentrations using sensitivity ratios:
      //   - Ethanol: Primary measurement (±10% accuracy)
      //   - H2: 0.25x ethanol (±20% accuracy)
      //   - CO: 0.15x ethanol (±30% accuracy)
      //   - LPG: 0.12x ethanol (±30% accuracy)
      //   - Propane: 0.10x ethanol (±30% accuracy)
      //   - NH3: 0.08x ethanol (±30% accuracy)
      //   - CH4: 0.05x ethanol (±40% accuracy)
      //
      // Note: These are approximate estimates due to cross-sensitivity.
      // For absolute accuracy, calibration with known gas concentrations is required.

      const voc = computeVocPpm(
        TELEMETRY_DATA.AIR_QUALITY_RAW,
        TELEMETRY_DATA.AQ_ETHANOL_PPM
      );
      TELEMETRY_DATA.VOC_PPM = voc;
      if (
        !TELEMETRY_DATA.AIR_QUALITY_PPM ||
        TELEMETRY_DATA.AIR_QUALITY_PPM === 0
      ) {
        TELEMETRY_DATA.AIR_QUALITY_PPM = voc;
      }

      // Calculate derived gas concentrations from ethanol baseline
      const gases =
        computeMICS5524Gases(
          TELEMETRY_DATA.AIR_QUALITY_RAW,
          undefined,
          TELEMETRY_DATA.AQ_ETHANOL_PPM
        ) || computeGasConcentrations(TELEMETRY_DATA.AQ_ETHANOL_PPM);

      TELEMETRY_DATA.AQ_CO_PPM = gases.AQ_CO_PPM;
      TELEMETRY_DATA.AQ_CH4_PPM = gases.AQ_CH4_PPM;
      TELEMETRY_DATA.AQ_NH3_PPM = gases.AQ_NH3_PPM;
      TELEMETRY_DATA.AQ_H2_PPM = gases.AQ_H2_PPM;
      TELEMETRY_DATA.AQ_LPG_PPM = gases.AQ_LPG_PPM;
      TELEMETRY_DATA.AQ_PROPANE_PPM = gases.AQ_PROPANE_PPM;

      return TELEMETRY_DATA as TelemetryData;
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
