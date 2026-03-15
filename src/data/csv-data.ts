import type { ITelemetryType } from "../types/telemetry";
import { getFlightStateName } from "../constants";

export { getFlightStateName };

// Re-export the canonical telemetry type so existing imports still work
export type ICanSatTelemetryData = ITelemetryType;

export interface TableColumn {
  header: string;
  accessor: keyof ICanSatTelemetryData;
}

export const columns: TableColumn[] = [
  { header: "TEAM_ID", accessor: "TEAM_ID" },
  { header: "MISSION_TIME_S", accessor: "MISSION_TIME_S" },
  { header: "PACKET_COUNT", accessor: "PACKET_COUNT" },
  { header: "ALTITUDE", accessor: "ALTITUDE" },
  { header: "PRESSURE", accessor: "PRESSURE" },
  { header: "TEMPERATURE", accessor: "TEMPERATURE" },
  { header: "VOLTAGE", accessor: "VOLTAGE" },
  { header: "GNSS_TIME", accessor: "GNSS_TIME" },
  { header: "LATITUDE", accessor: "LATITUDE" },
  { header: "LONGITUDE", accessor: "LONGITUDE" },
  { header: "GPS_ALTITUDE", accessor: "GPS_ALTITUDE" },
  { header: "SATELLITES", accessor: "SATELLITES" },
  { header: "ACCEL_X", accessor: "ACCEL_X" },
  { header: "ACCEL_Y", accessor: "ACCEL_Y" },
  { header: "ACCEL_Z", accessor: "ACCEL_Z" },
  { header: "GYRO_SPIN_RATE", accessor: "GYRO_SPIN_RATE" },
  { header: "FLIGHT_STATE", accessor: "FLIGHT_STATE" },
  { header: "GYRO_X", accessor: "GYRO_X" },
  { header: "GYRO_Y", accessor: "GYRO_Y" },
  { header: "GYRO_Z", accessor: "GYRO_Z" },
  { header: "ROLL", accessor: "ROLL" },
  { header: "PITCH", accessor: "PITCH" },
  { header: "YAW", accessor: "YAW" },
  { header: "MAG_X", accessor: "MAG_X" },
  { header: "MAG_Y", accessor: "MAG_Y" },
  { header: "MAG_Z", accessor: "MAG_Z" },
  { header: "HUMIDITY", accessor: "HUMIDITY" },
  { header: "CURRENT", accessor: "CURRENT" },
  { header: "POWER", accessor: "POWER" },
  { header: "BARO_ALTITUDE", accessor: "BARO_ALTITUDE" },
  { header: "MCU_TEMP_C", accessor: "MCU_TEMP_C" },
  { header: "RSSI_DBM", accessor: "RSSI_DBM" },
  { header: "RTC_EPOCH", accessor: "RTC_EPOCH" },
  { header: "CMD_ECHO", accessor: "CMD_ECHO" },
  { header: "LOG_DATA", accessor: "LOG_DATA" },
];
