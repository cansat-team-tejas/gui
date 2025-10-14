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
  connectionStatus: string;
  commandStatus: string;
  showResetConfirm: boolean;
  resetTimeout: NodeJS.Timeout | null;
  confirmationState: ConfirmationState;
  // AI service configuration
  aiServicePort: number;
  currentDatabaseFilename: string | null;
  // Go backend configuration
  xbeeBackendURL: string;
}

export type CriticalCommand =
  | "EMERGENCY"
  | "SHUTDOWN"
  | "PARACHUTE_DEPLOY"
  | "START"
  | "RESET";
