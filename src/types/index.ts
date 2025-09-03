// Type definitions for CanSat telemetry data
export interface TelemetryData {
  altitude: number;
  speed: number;
  temperature: number;
  pressure: number;
  latitude?: number;
  longitude?: number;
  timestamp: Date;
}

export interface MissionStatus {
  phase: "pre-launch" | "ascent" | "descent" | "landed" | "emergency";
  missionTime: number; // in seconds
  isConnected: boolean;
  lastUpdate: Date;
}

export interface SystemHealth {
  batteryLevel: number;
  signalStrength: number;
  sensors: {
    gps: boolean;
    accelerometer: boolean;
    barometer: boolean;
    temperature: boolean;
  };
}

// Electron API types
export interface ElectronAPI {
  sendMessage?: (message: string) => Promise<void>;
  onReceiveMessage?: (callback: (message: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
