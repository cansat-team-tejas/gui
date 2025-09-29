// Type aliases for compatibility
export type ICanSatTelemetryData = ITelemetryDataType;
export type PacketType = PACKET_TYPES;
export type ICanSatPacket = IXBeePacketType;

export interface TableColumn {
  header: string;
  accessor: keyof ICanSatTelemetryData;
}

// Packet type enum
export enum PACKET_TYPES {
  TELEMETRY = "TELEMETRY",
  LOG = "LOG",
  COMMAND_RESPONSE = "COMMAND_RESPONSE",
}

// Base packet interface
export interface IBasePacket {
  type: PACKET_TYPES;
  timestamp: Date;
  rawData: string;
}

// Log packet interface
export interface ILogPacket extends IBasePacket {
  type: PACKET_TYPES.LOG;
  logLevel: "INFO" | "DEBUG" | "WARN" | "ERROR";
  message: string;
}

// Command response packet interface
export interface ICommandResponsePacket extends IBasePacket {
  type: PACKET_TYPES.COMMAND_RESPONSE;
  command: string;
  response: string;
  success: boolean;
}

// Main telemetry packet interface
export interface ITelemetryPacket extends IBasePacket {
  type: PACKET_TYPES.TELEMETRY;
  data: ICanSatTelemetryData;
}

export type IXBeePacketType =
  | ITelemetryPacket
  | ILogPacket
  | ICommandResponsePacket;

export interface ITelemetryDataType {
  TEAM_ID: number;
  MISSION_TIME_S: number;
  PACKET_COUNT: number;
  ALTITUDE: number;
  PRESSURE: number;
  TEMP: number;
  VOLTAGE: number;
  LATITUDE: number;
  LONGITUDE: number;
  GPS_ALTITUDE: number;
  SATELLITES: number;
  ACCEL_X: number;
  ACCEL_Y: number;
  ACCEL_Z: number;
  GYRO_X: number;
  GYRO_Y: number;
  GYRO_Z: number;
  ROLL: number;
  PITCH: number;
  YAW: number;
  GYRO_SPIN: number;
  FLIGHT_STATE: number;
  CURRENT: number;
  POWER: number;
  MAG_X: number;
  MAG_Y: number;
  MAG_Z: number;
  HUMIDITY: number;
  AIR_QUALITY_RAW: number;
  AIR_QUALITY_PPM: number;
  BARO_ALTITUDE: number;
  RSSI_DBM: number;
  AQ_CO_PPM: number;
  AQ_CH4_PPM: number;
  AQ_NH3_PPM: number;
  AQ_H2_PPM: number;
  AQ_ETHANOL_PPM: number;
  MCU_TEMP_C: number;
  HEALTH_FLAGS: number;
  CMD_ECHO: string;
  LOG_DATA: string;
}

// Flight State Constants
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

export const getFlightStateName = (state: number): string => {
  return (
    FLIGHT_STATES[state as keyof typeof FLIGHT_STATES] || `UNKNOWN(${state})`
  );
};

export const columns: TableColumn[] = [
  { header: "TEAM_ID", accessor: "TEAM_ID" },
  { header: "MISSION_TIME", accessor: "MISSION_TIME_S" },
  { header: "PACKET_COUNT", accessor: "PACKET_COUNT" },
  { header: "ALTITUDE", accessor: "ALTITUDE" },
  { header: "PRESSURE", accessor: "PRESSURE" },
  { header: "TEMP", accessor: "TEMP" },
  { header: "VOLTAGE", accessor: "VOLTAGE" },
  { header: "LATITUDE", accessor: "LATITUDE" },
  { header: "LONGITUDE", accessor: "LONGITUDE" },
  { header: "GPS_ALT", accessor: "GPS_ALTITUDE" },
  { header: "SATELLITES", accessor: "SATELLITES" },
  { header: "ACCEL_X", accessor: "ACCEL_X" },
  { header: "ACCEL_Y", accessor: "ACCEL_Y" },
  { header: "ACCEL_Z", accessor: "ACCEL_Z" },
  { header: "GYRO_X", accessor: "GYRO_X" },
  { header: "GYRO_Y", accessor: "GYRO_Y" },
  { header: "GYRO_Z", accessor: "GYRO_Z" },
  { header: "ROLL", accessor: "ROLL" },
  { header: "PITCH", accessor: "PITCH" },
  { header: "YAW", accessor: "YAW" },
  { header: "GYRO_SPIN", accessor: "GYRO_SPIN" },
  { header: "FLIGHT_STATE", accessor: "FLIGHT_STATE" },
  { header: "CURRENT", accessor: "CURRENT" },
  { header: "POWER", accessor: "POWER" },
  { header: "MAG_X", accessor: "MAG_X" },
  { header: "MAG_Y", accessor: "MAG_Y" },
  { header: "MAG_Z", accessor: "MAG_Z" },
  { header: "HUMIDITY", accessor: "HUMIDITY" },
  { header: "AIR_QUALITY_RAW", accessor: "AIR_QUALITY_RAW" },
  { header: "AIR_QUALITY_PPM", accessor: "AIR_QUALITY_PPM" },
  { header: "BARO_ALT", accessor: "BARO_ALTITUDE" },
  { header: "RSSI_DBM", accessor: "RSSI_DBM" },
  { header: "AQ_CO_PPM", accessor: "AQ_CO_PPM" },
  { header: "AQ_CH4_PPM", accessor: "AQ_CH4_PPM" },
  { header: "AQ_NH3_PPM", accessor: "AQ_NH3_PPM" },
  { header: "AQ_H2_PPM", accessor: "AQ_H2_PPM" },
  { header: "AQ_ETHANOL_PPM", accessor: "AQ_ETHANOL_PPM" },
  { header: "MCU_TEMP_C", accessor: "MCU_TEMP_C" },
  { header: "HEALTH_FLAGS", accessor: "HEALTH_FLAGS" },
  { header: "CMD_ECHO", accessor: "CMD_ECHO" },
  { header: "LOG_DATA", accessor: "LOG_DATA" },
];
