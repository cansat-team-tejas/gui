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

export interface ConfirmationState {
  isOpen: boolean;
  command: string | null;
  timeoutId: NodeJS.Timeout | null;
  timeRemaining: number;
}

export interface SettingsState {
  isScanning: boolean;
  isConnecting: boolean;
  connectionStatus: string;
  commandStatus: string;
  showResetConfirm: boolean;
  resetTimeout: NodeJS.Timeout | null;
  confirmationState: ConfirmationState;
  // AI service configuration
  aiServicePort: number;
  currentDatabaseFilename: string | null;
}

export type CriticalCommand =
  | "EMERGENCY"
  | "SHUTDOWN"
  | "LANDER_STAGE1"
  | "LANDER_STAGE2"
  | "SECONDARY_DEPLOY"
  | "START"
  | "RESET";

export interface ConnectionStatus {
  isConnected: boolean;
  selectedPort: string | null;
  status: string;
}
