// Global type definitions for Electron API in renderer process

export interface TelemetryData {
  altitude: number;
  speed: number;
  temperature: number;
  pressure: number;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface MissionState {
  isActive: boolean;
  phase: 'pre-launch' | 'ascent' | 'descent' | 'landed' | 'emergency';
  missionTime: number;
}

export interface ElectronAPI {
  // Telemetry functions
  sendTelemetryData: (data: TelemetryData) => void;
  onTelemetryUpdate: (callback: (data: TelemetryData) => void) => void;
  
  // Mission control functions
  startMission: () => Promise<boolean>;
  stopMission: () => Promise<boolean>;
  deployParachute: () => Promise<boolean>;
  
  // System functions
  getSystemInfo: () => Promise<any>;
  
  // File operations
  saveData: (data: any, filename: string) => Promise<boolean>;
  loadData: (filename: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
