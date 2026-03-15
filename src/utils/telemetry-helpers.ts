import type { ITelemetryType } from "../types/telemetry";
import type { ICanSatTelemetryData } from "../data/csv-data";

export const transformTelemetryToCSV = (
  telemetryData: ITelemetryType[]
): ICanSatTelemetryData[] => {
  return telemetryData.map((telemetry) => ({
    TEAM_ID: telemetry.TEAM_ID ?? "046",
    MISSION_TIME_S: telemetry.MISSION_TIME_S ?? 0,
    PACKET_COUNT: telemetry.PACKET_COUNT ?? 0,
    ALTITUDE: telemetry.ALTITUDE ?? 0,
    PRESSURE: telemetry.PRESSURE ?? 0,
    TEMPERATURE: telemetry.TEMPERATURE ?? 0,
    VOLTAGE: telemetry.VOLTAGE ?? 0,
    GNSS_TIME: telemetry.GNSS_TIME ?? "",
    LATITUDE: telemetry.LATITUDE ?? 0,
    LONGITUDE: telemetry.LONGITUDE ?? 0,
    GPS_ALTITUDE: telemetry.GPS_ALTITUDE ?? 0,
    SATELLITES: telemetry.SATELLITES ?? 0,
    ACCEL_X: telemetry.ACCEL_X ?? 0,
    ACCEL_Y: telemetry.ACCEL_Y ?? 0,
    ACCEL_Z: telemetry.ACCEL_Z ?? 0,
    GYRO_SPIN_RATE: telemetry.GYRO_SPIN_RATE ?? 0,
    FLIGHT_STATE: telemetry.FLIGHT_STATE ?? 0,
    GYRO_X: telemetry.GYRO_X ?? 0,
    GYRO_Y: telemetry.GYRO_Y ?? 0,
    GYRO_Z: telemetry.GYRO_Z ?? 0,
    ROLL: telemetry.ROLL ?? 0,
    PITCH: telemetry.PITCH ?? 0,
    YAW: telemetry.YAW ?? 0,
    MAG_X: telemetry.MAG_X ?? 0,
    MAG_Y: telemetry.MAG_Y ?? 0,
    MAG_Z: telemetry.MAG_Z ?? 0,
    HUMIDITY: telemetry.HUMIDITY ?? 0,
    CURRENT: telemetry.CURRENT ?? 0,
    POWER: telemetry.POWER ?? 0,
    BARO_ALTITUDE: telemetry.BARO_ALTITUDE ?? 0,
    MCU_TEMP_C: telemetry.MCU_TEMP_C ?? 0,
    RSSI_DBM: telemetry.RSSI_DBM ?? 0,
    RTC_EPOCH: telemetry.RTC_EPOCH ?? 0,
    CMD_ECHO: telemetry.CMD_ECHO ?? "",
    LOG_DATA: telemetry.LOG_DATA ?? "",
  }));
};

export const getSafeTelemetryData = (
  telemetry: ITelemetryType | null
): ITelemetryType => {
  return (
    telemetry || {
      TEAM_ID: "046",
      MISSION_TIME_S: 0,
      PACKET_COUNT: 0,
      ALTITUDE: 0,
      PRESSURE: 0,
      TEMPERATURE: 0,
      VOLTAGE: 0,
      GNSS_TIME: "",
      LATITUDE: 0,
      LONGITUDE: 0,
      GPS_ALTITUDE: 0,
      SATELLITES: 0,
      ACCEL_X: 0,
      ACCEL_Y: 0,
      ACCEL_Z: 0,
      GYRO_SPIN_RATE: 0,
      FLIGHT_STATE: 0,
      CURRENT: 0,
      POWER: 0,
      GYRO_X: 0,
      GYRO_Y: 0,
      GYRO_Z: 0,
      ROLL: 0,
      PITCH: 0,
      YAW: 0,
      MAG_X: 0,
      MAG_Y: 0,
      MAG_Z: 0,
      HUMIDITY: 0,
      BARO_ALTITUDE: 0,
      RSSI_DBM: 0,
      MCU_TEMP_C: 0,
      RTC_EPOCH: 0,
      CMD_ECHO: "",
      LOG_DATA: "",
    }
  );
};

export const formatTelemetryValue = (
  value: number,
  precision: number = 1
): string => {
  if (typeof value !== "number" || isNaN(value)) {
    return "0.0";
  }
  return value.toFixed(precision);
};

export const getRSSIStatus = (
  rssi: number
): { color: string; status: string } => {
  if (rssi > -50) {
    return { color: "bg-[#00AD57]", status: "EXCELLENT" };
  } else if (rssi > -70) {
    return { color: "bg-[#FFAB00]", status: "GOOD" };
  } else {
    return { color: "bg-red-500", status: "POOR" };
  }
};
