/**
 * XBee Store Types and Interfaces
 */
import type {
  ITelemetryType,
  ICommandType,
  ILogEntryType,
} from "../../types/telemetry";

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export type ActivityItem = {
  timestamp: Date;
  type: "FRAME_RECEIVED" | "FRAME_SENT" | "CONNECTION" | "ERROR";
  frameType?: string;
  details?: string;
};

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface FrameStats {
  telemetryCount: number;
  commandEchoCount: number;
  logEntryCount: number;
  unknownCount: number;
}

export interface ConnectionStats {
  packetsReceived: number;
  packetsSent: number;
  errorsCount: number;
}

// ============================================================================
// STATE INTERFACES
// ============================================================================

export interface TelemetryState {
  history: ITelemetryType[];
  lastUpdate: Date | null;
  dataRate: number; // Hz
  missionStartTime: Date | null;
  totalMissionTime: number; // seconds
}

export interface CommunicationState {
  commandEchoHistory: ICommandType[];
  logEntries: ILogEntryType[];
  rssi: {
    uplink: number | null;
    downlink: number | null;
    lastUpdate: Date | null;
  };
}

export interface ConnectionState {
  isConnected: boolean;
  availablePorts: any[];
  selectedPort: string | null;
  connectionTime: Date | null;
  autoDetecting: boolean;
}

export interface StatisticsState {
  packetsReceived: number;
  packetsSent: number;
  errorsCount: number;
  processingErrors: number;
  totalFramesProcessed: number;
  frameStats: FrameStats;
}

export interface ActivityState {
  log: ActivityItem[];
}

// ============================================================================
// ACTION INTERFACES
// ============================================================================

export interface TelemetryActions {
  updateTelemetry: (data: ITelemetryType) => void;
  clearTelemetry: () => void;
  getTelemetryByTimeRange: (startTime: Date, endTime: Date) => ITelemetryType[];
}

export interface CommunicationActions {
  addCommandEcho: (command: ICommandType) => void;
  addLogEntry: (log: ILogEntryType) => void;
  clearCommandHistory: () => void;
  clearLogEntries: () => void;
  getRecentLogs: (count?: number) => ILogEntryType[];
  getRecentCommands: (count?: number) => ICommandType[];
  updateRSSI: (uplink?: number, downlink?: number) => void;
  getRSSI: () => Promise<{ uplink: number | null; downlink: number | null }>;
}

export interface ConnectionActions {
  setConnected: (connected: boolean) => void;
  setAvailablePorts: (ports: any[]) => void;
  setSelectedPort: (port: string | null) => void;
  scanPorts: () => Promise<void>;
  connect: (port: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  autoDetectAndConnect: () => Promise<boolean>;
  setAutoDetecting: (detecting: boolean) => void;
}

export interface FrameProcessingActions {
  processFrame: (raw: string) => void;
  resetProcessingStats: () => void;
}

export interface TransmissionActions {
  transmit: (data: string) => Promise<boolean>;
}

export interface ActivityActions {
  addActivity: (
    type: ActivityItem["type"],
    frameType?: string,
    details?: string
  ) => void;
  clearActivityLog: () => void;
}

// ============================================================================
// MAIN STORE INTERFACE
// ============================================================================

export interface XBeeStore {
  // === STATE ===
  telemetry: TelemetryState;
  communication: CommunicationState;
  connection: ConnectionState;
  statistics: StatisticsState;
  activity: ActivityState;

  // === ACTIONS ===
  updateTelemetry: (data: ITelemetryType) => void;
  clearTelemetry: () => void;
  getTelemetryByTimeRange: (startTime: Date, endTime: Date) => ITelemetryType[];

  addCommandEcho: (command: ICommandType) => void;
  addLogEntry: (log: ILogEntryType) => void;
  clearCommandHistory: () => void;
  clearLogEntries: () => void;
  getRecentLogs: (count?: number) => ILogEntryType[];
  getRecentCommands: (count?: number) => ICommandType[];
  updateRSSI: (uplink?: number, downlink?: number) => void;
  getRSSI: () => Promise<{ uplink: number | null; downlink: number | null }>;

  setConnected: (connected: boolean) => void;
  setAvailablePorts: (ports: any[]) => void;
  setSelectedPort: (port: string | null) => void;
  scanPorts: () => Promise<void>;
  connect: (port: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  autoDetectAndConnect: () => Promise<boolean>;
  setAutoDetecting: (detecting: boolean) => void;

  processFrame: (raw: string) => void;
  resetProcessingStats: () => void;

  transmit: (data: string) => Promise<boolean>;

  addActivity: (
    type: ActivityItem["type"],
    frameType?: string,
    details?: string
  ) => void;
  clearActivityLog: () => void;
}
