/**
 * Settings page main index
 * Centralized exports for settings functionality
 */

// Main settings page
export { default as SettingsPage } from "./index";

// Components
export * from "./components";

// Hooks
export * from "./hooks";

// Types and schemas
export type {
  Command,
  CommandCategory,
  SettingsState,
  ConfirmationState,
  CriticalCommand,
} from "./types";
export * from "./schemas";
export * from "./constants";
