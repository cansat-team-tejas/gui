// Packet and table type definitions
export enum PACKET_TYPES {
  TELEMETRY = "TELEMETRY",
  LOG = "LOG",
  COMMAND_RESPONSE = "COMMAND_RESPONSE",
}

export interface IBasePacket {
  type: PACKET_TYPES;
  timestamp: Date;
  rawData: string;
}

export interface ILogPacket extends IBasePacket {
  type: PACKET_TYPES.LOG;
  logLevel: "INFO" | "DEBUG" | "WARN" | "ERROR";
  message: string;
}

export interface ICommandResponsePacket extends IBasePacket {
  type: PACKET_TYPES.COMMAND_RESPONSE;
  command: string;
  response: string;
  success: boolean;
}

export interface ITelemetryPacket extends IBasePacket {
  type: PACKET_TYPES.TELEMETRY;
  data: ITelemetryDataType;
}

export type IXBeePacketType =
  | ITelemetryPacket
  | ILogPacket
  | ICommandResponsePacket;

export interface ITelemetryDataType {
  TEAM_ID: string;
  MISSION_TIME_S: number;
  PACKET_COUNT: number;
  ALTITUDE: number;
  PRESSURE: number;
  TEMPERATURE: number;
  VOLTAGE: number;
  GNSS_TIME: string;
  LATITUDE: number;
  LONGITUDE: number;
  GPS_ALTITUDE: number;
  SATELLITES: number;
  ACCEL_X: number;
  ACCEL_Y: number;
  ACCEL_Z: number;
  GYRO_SPIN_RATE: number;
  FLIGHT_STATE: number;
  GYRO_X: number;
  GYRO_Y: number;
  GYRO_Z: number;
  ROLL: number;
  PITCH: number;
  YAW: number;
  MAG_X: number;
  MAG_Y: number;
  MAG_Z: number;
  HUMIDITY: number;
  CURRENT: number;
  POWER: number;
  BARO_ALTITUDE: number;
  MCU_TEMP_C: number;
  RSSI_DBM: number;
  RTC_EPOCH: number;
  CMD_ECHO: string;
  LOG_DATA: string;
}

export type ICanSatTelemetryData = ITelemetryDataType;
export type PacketType = PACKET_TYPES;
export type ICanSatPacket = IXBeePacketType;

export interface TableColumn {
  header: string;
  accessor: keyof ICanSatTelemetryData;
}

// Flight State Constants and helper
export const FLIGHT_STATES = {
  0: "BOOT",
  1: "TEST_MODE",
  2: "LAUNCH_PAD",
  3: "ASCENT",
  4: "ROCKET_DEPLOY",
  5: "DESCENT",
  6: "SECONDARY_DEPLOY",
  7: "FINAL_DESCENT",
  8: "IMPACT",
} as const;

export const getFlightStateName = (state: number): string =>
  FLIGHT_STATES[state as keyof typeof FLIGHT_STATES] || `UNKNOWN(${state})`;

// Telemetry columns matching C++ specification (29 fields)
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
