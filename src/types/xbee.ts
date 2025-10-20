export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

export interface SerialPortOptions {
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 2;
  parity: "none" | "even" | "mark" | "odd" | "space";
}

export interface SerialPortStatus {
  isOpen: boolean;
  path: string | null;
}

export interface XBeeFrame {
  type: number;
  id?: number;
  destination64?: string;
  destination16?: string;
  data?: Uint8Array;
  commandParameter?: Uint8Array;
  command?: string;
  remoteCommandOptions?: number;
}

export interface XBeeTransmitFrame extends XBeeFrame {
  type: 0x10;
  destination64: string;
  destination16: string;
  broadcastRadius: number;
  options: number;
  data: Uint8Array;
}

export interface XBeeReceiveFrame extends XBeeFrame {
  type: 0x90;
  source64: string;
  source16: string;
  receiveOptions: number;
  data: Uint8Array;
}

export interface XBeeExplicitRxFrame extends XBeeFrame {
  type: 0x91;
  source64: string;
  source16: string;
  sourceEndpoint: number;
  destinationEndpoint: number;
  clusterId: number;
  profileId: number;
  receiveOptions: number;
  data: Uint8Array;
}

export interface ExplicitFrameMetadata {
  sourceEndpoint: number;
  destinationEndpoint: number;
  clusterId: number;
  profileId: number;
}

export interface ProcessedXBeeFrame {
  type: number;
  data: string;
  explicitMetadata?: ExplicitFrameMetadata;
  packetType?: "TELEMETRY" | "LOG" | "CMD_RESPONSE" | "UNKNOWN";
  timestamp?: Date;
}

export interface XBeeATCommandFrame extends XBeeFrame {
  type: 0x08;
  command: string;
  commandParameter: Uint8Array;
}

export interface XBeeATCommandResponseFrame extends XBeeFrame {
  type: 0x88;
  command: string;
  commandStatus: number;
  commandData: Uint8Array;
}

export interface ConnectionState {
  isConnected: boolean;
  port: string | null;
  lastError: string | null;
  connectionTime: Date | null;
}

export const XBEE_DEFAULTS = {
  BAUDRATE: 115000 as const,
  DATA_BITS: 8 as const,
  STOP_BITS: 1 as const,
  PARITY: "none" as const,
  API_MODE: 2 as const,
  BROADCAST_ADDRESS_16: "FFFE",
} as const;

export const MISSION_CONFIG = {
  DESTINATION_ADDRESS: "0013A200426E25F8",
  RECEIVE_INTERVAL: 1000,
  TRANSMIT_INTERVAL: 5000,
  ACKNOWLEDGEMENT_INTERVAL: 2000,
} as const;

export const FRAME_ADDRESS_TYPES = {
  TX_REQUEST: 0x10,
  TX_STATUS: 0x8b,
  RX_PACKET: 0x90,
  RX_EXPLICIT_PACKET: 0x91,
  RX_IO_PACKET: 0x92,
  AT_COMMAND: 0x08,
  AT_COMMAND_QUEUE: 0x09,
  AT_RESPONSE: 0x88,
  MODEM_STATUS: 0x8a,
  REMOTE_AT_COMMAND: 0x17,
  REMOTE_AT_RESPONSE: 0x97,
} as const;

export type XBeeFrameType =
  (typeof FRAME_ADDRESS_TYPES)[keyof typeof FRAME_ADDRESS_TYPES];
