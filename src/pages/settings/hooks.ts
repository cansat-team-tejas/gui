/**
 * Settings page hooks
 * Custom hooks for settings functionality using RHF and Zod
 */
// import { useEffect } from "react"; // Temporarily disabled auto-scanning
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsState, CriticalCommand, ConfirmationState } from "./types";
import { CustomCommandFormData, customCommandSchema } from "./schemas";
import { CRITICAL_COMMANDS } from "./constants";
import { useTransmit } from "../../hooks/use-xbee-go";
import { useXBeeGoStore } from "../../store/xbee-go";
import {
  createMCPService,
  generateMissionFilename,
} from "../../utils/mcp-service";
import { useSettingsStore } from "../../store/settings";
import { useShallow } from "zustand/react/shallow";

export const useSettingsState = (): SettingsState & {
  setConnectionStatus: (status: string) => void;
  setCommandStatus: (status: string) => void;
  setShowResetConfirm: (show: boolean) => void;
  setResetTimeout: (timeout: NodeJS.Timeout | null) => void;
  setConfirmationState: (
    state: ConfirmationState | ((prev: ConfirmationState) => ConfirmationState)
  ) => void;
  setAiServicePort: (port: number) => void;
  setCurrentDatabaseFilename: (filename: string | null) => void;
  setXbeeBackendURL: (url: string) => void;
} =>
  useSettingsStore(
    useShallow((state) => ({
      connectionStatus: state.connectionStatus,
      commandStatus: state.commandStatus,
      showResetConfirm: state.showResetConfirm,
      resetTimeout: state.resetTimeout,
      confirmationState: state.confirmationState,
      aiServicePort: state.aiServicePort,
      currentDatabaseFilename: state.currentDatabaseFilename,
      xbeeBackendURL: state.xbeeBackendURL,
      setConnectionStatus: state.setConnectionStatus,
      setCommandStatus: state.setCommandStatus,
      setShowResetConfirm: state.setShowResetConfirm,
      setResetTimeout: state.setResetTimeout,
      setConfirmationState: state.setConfirmationState,
      setAiServicePort: state.setAiServicePort,
      setCurrentDatabaseFilename: state.setCurrentDatabaseFilename,
      setXbeeBackendURL: state.setXbeeBackendURL,
    }))
  );

// RHF form hooks
export const useCustomCommandForm = () => {
  return useForm<CustomCommandFormData>({
    resolver: zodResolver(customCommandSchema),
    defaultValues: {
      command: "",
    },
  });
};

export const useCommandManagement = (
  settingsState: ReturnType<typeof useSettingsState>
) => {
  const transmit = useTransmit();
  const resetStore = useXBeeGoStore((state) => state.resetStore);
  const prepareForMissionStart = useXBeeGoStore(
    (state) => state.prepareForMissionStart
  );

  const RESET_TRIGGERING_COMMANDS = ["START", "RESET", "SHUTDOWN"];

  const isCriticalCommand = (cmd: string): cmd is CriticalCommand => {
    return CRITICAL_COMMANDS.includes(cmd as CriticalCommand);
  };

  const startConfirmationTimeout = (command: string) => {
    let timeLeft = 30;

    const updateTimer = () => {
      timeLeft -= 1;
      settingsState.setConfirmationState((prev) => ({
        ...prev,
        timeRemaining: timeLeft,
      }));

      if (timeLeft <= 0) {
        // Timeout expired
        settingsState.setConfirmationState({
          isOpen: false,
          command: null,
          timeoutId: null,
          timeRemaining: 30,
        });
        settingsState.setCommandStatus(
          `CONFIRM:TIMEOUT_EXPIRED for ${command}`
        );
      }
    };

    const intervalId = setInterval(updateTimer, 1000);

    settingsState.setConfirmationState((prev) => ({
      ...prev,
      timeoutId: intervalId,
    }));

    // Auto-clear after 30 seconds
    setTimeout(() => {
      clearInterval(intervalId);
    }, 30000);
  };

  const handleSendCommand = async (command: string) => {
    if (!command.trim()) return;

    try {
      // Check if this is a critical command requiring confirmation
      if (isCriticalCommand(command)) {
        // Show confirmation dialog
        settingsState.setConfirmationState({
          isOpen: true,
          command,
          timeoutId: null,
          timeRemaining: 30,
        });
        startConfirmationTimeout(command);
        settingsState.setCommandStatus(`Confirmation required for: ${command}`);
        return;
      }

      // Execute non-critical commands immediately
      await executeCommand(command);
    } catch (error) {
      settingsState.setCommandStatus("Command transmission error");
    }
  };

  const executeCommand = async (command: string) => {
    try {
      // Special handling for START command - reset GUI first and initialize mission
      if (command === "START") {
        prepareForMissionStart();
        settingsState.setCommandStatus("GUI reset for new mission");
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Request backend to start a new mission and capture database path
        try {
          const newFilename = generateMissionFilename("TEJAS");
          const mcpService = createMCPService(settingsState.xbeeBackendURL);
          const result = await mcpService.createDatabase(newFilename);
          const missionPath = result.mission?.dbPath ?? newFilename;

          settingsState.setCurrentDatabaseFilename(missionPath);
          settingsState.setCommandStatus(
            result.mission
              ? `Mission started: ${result.mission.name}`
              : `Mission start requested: ${newFilename}`
          );
        } catch (error) {
          console.warn("Failed to create mission database:", error);
          settingsState.setCommandStatus(
            "Database creation failed, continuing with command"
          );
        }
      }

      const success = await transmit(command);
      if (success) {
        settingsState.setCommandStatus(`Command sent: ${command}`);

        // Check if other reset commands should trigger GUI reset (after sending)
        if (
          RESET_TRIGGERING_COMMANDS.includes(command) &&
          command !== "START"
        ) {
          setTimeout(() => {
            resetStore();
            settingsState.setCommandStatus(
              `GUI reset triggered by: ${command}`
            );
          }, 500);
        }
      } else {
        settingsState.setCommandStatus("Failed to send command");
      }
    } catch (error) {
      settingsState.setCommandStatus("Command execution error");
    }
  };

  const handleConfirmCommand = async () => {
    const { command, timeoutId } = settingsState.confirmationState;

    if (!command) return;

    // Clear timeout
    if (timeoutId) {
      clearInterval(timeoutId);
    }

    // Close confirmation dialog
    settingsState.setConfirmationState({
      isOpen: false,
      command: null,
      timeoutId: null,
      timeRemaining: 30,
    });

    // Send confirmation command
    const confirmCommand = command;
    await executeCommand(confirmCommand);
  };

  const handleCancelCommand = () => {
    const { timeoutId } = settingsState.confirmationState;

    // Clear timeout
    if (timeoutId) {
      clearInterval(timeoutId);
    }

    // Close confirmation dialog
    settingsState.setConfirmationState({
      isOpen: false,
      command: null,
      timeoutId: null,
      timeRemaining: 30,
    });

    settingsState.setCommandStatus("Command cancelled by user");
  };

  const handleQnhSet = async (qnhValue: string) => {
    await handleSendCommand(`QNH:${qnhValue}`);
  };

  return {
    handleSendCommand,
    handleConfirmCommand,
    handleCancelCommand,
    handleQnhSet,
  };
};
