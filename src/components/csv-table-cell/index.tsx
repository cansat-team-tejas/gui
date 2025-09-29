import { ICanSatTelemetryData, getFlightStateName } from "../../data/csv-data";
import {
  parseLogMessage,
  getLogDisplayMessage,
} from "../../constants/log-constants";

interface CsvTableCellProps {
  value: any;
  fieldName: keyof ICanSatTelemetryData;
}

const CsvTableCell: React.FC<CsvTableCellProps> = ({ value, fieldName }) => {
  const formatValue = (val: any, field: keyof ICanSatTelemetryData): string => {
    if (val === null || val === undefined) return "";

    switch (field) {
      case "FLIGHT_STATE":
        return `${val} (${getFlightStateName(val)})`;

      case "MISSION_TIME_S":
        return `${val.toFixed(2)}s`;

      case "LATITUDE":
      case "LONGITUDE":
        return val.toFixed(5);

      case "ALTITUDE":
      case "GPS_ALTITUDE":
      case "BARO_ALTITUDE":
        return `${val.toFixed(1)}m`;

      case "TEMP":
        return `${val.toFixed(1)}°C`;

      case "VOLTAGE":
        return `${val.toFixed(1)}V`;

      case "CURRENT":
        return `${val.toFixed(1)}A`;

      case "POWER":
        return `${val.toFixed(1)}W`;

      case "PRESSURE":
        return `${val.toFixed(0)}Pa`;

      case "HUMIDITY":
        return `${val.toFixed(1)}%`;

      case "RSSI_DBM":
        return `${val}dBm`;

      case "ACCEL_X":
      case "ACCEL_Y":
      case "ACCEL_Z":
      case "GYRO_X":
      case "GYRO_Y":
      case "GYRO_Z":
      case "MAG_X":
      case "MAG_Y":
      case "MAG_Z":
      case "ROLL":
      case "PITCH":
      case "YAW":
      case "GYRO_SPIN":
        return val.toFixed(2);

      case "AIR_QUALITY_PPM":
      case "AQ_CO_PPM":
      case "AQ_CH4_PPM":
      case "AQ_NH3_PPM":
      case "AQ_H2_PPM":
      case "AQ_ETHANOL_PPM":
        return `${val.toFixed(1)}ppm`;

      case "MCU_TEMP_C":
        return `${val.toFixed(1)}°C`;

      case "HEALTH_FLAGS":
        return `0x${val.toString(16).toUpperCase().padStart(4, "0")}`;

      case "LOG_DATA":
        if (!val || val === "") return "";
        const parsedLog = parseLogMessage(val);
        if (parsedLog.isSystemLog) {
          if ((parsedLog as any).isMultiEntry) {
            const entryCount = (parsedLog as any).entries?.length || 0;
            // Show a clean summary for multi-entry logs
            const categories = parsedLog.meaning
              .split(" | ")
              .map((cat) => cat.split(":")[0].trim())
              .join(", ");
            return `${entryCount} Events: ${categories}`;
          } else {
            // Show GUI-friendly display message
            const displayMsg = getLogDisplayMessage(parsedLog.symbol || "");
            return (
              displayMsg.substring(0, 35) +
              (displayMsg.length > 35 ? "..." : "")
            );
          }
        }
        return (
          val.toString().substring(0, 20) +
          (val.toString().length > 20 ? "..." : "")
        );

      case "CMD_ECHO":
        if (!val || val === "") return "";
        return (
          val.toString().substring(0, 20) +
          (val.toString().length > 20 ? "..." : "")
        );

      default:
        return val.toString();
    }
  };

  const formattedValue = formatValue(value, fieldName);

  // Add special styling for certain fields
  const getCellClassName = (): string => {
    let baseClass =
      "flex items-center justify-center h-[25px] px-2 py-1 border-b border-black text-[10px] font-bold text-black text-center bg-white hover:bg-gray-50 transition-colors";

    switch (fieldName) {
      case "FLIGHT_STATE":
        const stateColors: Record<number, string> = {
          0: "bg-gray-100", // BOOT
          1: "bg-yellow-100", // TEST_MODE
          2: "bg-blue-100", // LAUNCH_PAD
          3: "bg-green-100", // ASCENT
          4: "bg-orange-100", // ROCKET_DEPLOY
          5: "bg-red-100", // DESCENT
          6: "bg-purple-100", // SECONDARY_DEPLOY
          7: "bg-pink-100", // FINAL_DESCENT
          8: "bg-gray-200", // IMPACT
        };
        return baseClass.replace("bg-white", stateColors[value] || "bg-white");

      case "VOLTAGE":
        if (value < 11) return baseClass.replace("bg-white", "bg-red-100");
        if (value < 12) return baseClass.replace("bg-white", "bg-yellow-100");
        return baseClass.replace("bg-white", "bg-green-100");

      case "SATELLITES":
        if (value < 4) return baseClass.replace("bg-white", "bg-red-100");
        if (value < 6) return baseClass.replace("bg-white", "bg-yellow-100");
        return baseClass.replace("bg-white", "bg-green-100");

      case "LOG_DATA":
        if (!value || value === "") return baseClass;
        const parsedLog = parseLogMessage(value);
        if (parsedLog.isSystemLog) {
          const categoryColors: Record<string, string> = {
            SYSTEM: "bg-blue-100",
            FLIGHT_STATES: "bg-purple-100",
            PARACHUTE: "bg-red-100",
            GPS: "bg-green-100",
            IMU: "bg-indigo-100",
            POWER: "bg-yellow-100",
            COMMUNICATION: "bg-cyan-100",
            SD_CARD: "bg-gray-100",
            CALIBRATION: "bg-pink-100",
          };
          return baseClass.replace(
            "bg-white",
            categoryColors[parsedLog.category] || "bg-orange-100"
          );
        }
        return baseClass.replace("bg-white", "bg-orange-50");

      case "CMD_ECHO":
        if (!value || value === "") return baseClass;
        return baseClass.replace("bg-white", "bg-green-50");

      default:
        return baseClass;
    }
  };

  return <div className={getCellClassName()}>{formattedValue}</div>;
};

export default CsvTableCell;
