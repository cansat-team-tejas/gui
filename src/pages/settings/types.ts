/**
 * Settings page types and interfaces
 */

export interface Command {
  label: string;
  command: string;
  description?: string;
}

export interface CommandCategory {
  title: string;
  type: "system" | "emergency" | "calibration" | "flight" | "sdcard" | "reset";
  commands: Command[];
  danger?: boolean;
}

export interface SettingsState {
  isScanning: boolean;
  isConnecting: boolean;
  connectionStatus: string;
  commandStatus: string;
  showResetConfirm: boolean;
  resetTimeout: NodeJS.Timeout | null;
}

export interface ConnectionStatus {
  isConnected: boolean;
  selectedPort: string | null;
  status: string;
}
