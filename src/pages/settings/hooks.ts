/**
 * Settings page hooks
 * Custom hooks for settings functionality using RHF and Zod
 */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsState, CriticalCommand, ConfirmationState } from "./types";
import { CustomCommandFormData, customCommandSchema } from "./schemas";
import { CRITICAL_COMMANDS } from "./constants";
import {
  useScanPorts,
  useConnect,
  useDisconnect,
  useSetSelectedPort,
  useTransmit,
} from "../../hooks/use-xbee";
import { useXBeeStore } from "../../store/xbee";
import {
  createMCPService,
  generateMissionFilename,
} from "../../utils/mcp-service";

export const useSettingsState = (): SettingsState & {
  setIsScanning: (scanning: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionStatus: (status: string) => void;
  setCommandStatus: (status: string) => void;
  setShowResetConfirm: (show: boolean) => void;
  setResetTimeout: (timeout: NodeJS.Timeout | null) => void;
  setConfirmationState: (
    state: ConfirmationState | ((prev: ConfirmationState) => ConfirmationState)
  ) => void;
  // AI service port
  aiServicePort: number;
  setAiServicePort: (port: number) => void;
  // Database filename
  currentDatabaseFilename: string | null;
  setCurrentDatabaseFilename: (filename: string | null) => void;
  backendReadOnly: boolean;
  setBackendReadOnly: (readOnly: boolean) => void;
} => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [commandStatus, setCommandStatus] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout | null>(null);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>(
    {
      isOpen: false,
      command: null,
      timeoutId: null,
      timeRemaining: 30,
    }
  );
  // AI service port (default 8000)
  const [aiServicePort, setAiServicePort] = useState<number>(8000);
  // Current database filename for MCP service
  const [currentDatabaseFilename, setCurrentDatabaseFilename] = useState<
    string | null
  >(null);
  const [backendReadOnly, setBackendReadOnly] = useState(false);

  // On mount, try to read active DB from backend and set it
  useEffect(() => {
    const init = async () => {
      try {
        const mcp = createMCPService(aiServicePort);
        const res = await mcp.getCurrentDatabase();
        setBackendReadOnly(Boolean(res?.read_only));
        if (res?.current_db_path) {
          // Store just the basename for display if path like databases/mission_*.db
          const parts = res.current_db_path.split("/");
          setCurrentDatabaseFilename(
            parts[parts.length - 1] || res.current_db_path
          );
        }
      } catch (e) {
        // ignore silently on startup
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isScanning,
    isConnecting,
    connectionStatus,
    commandStatus,
    showResetConfirm,
    resetTimeout,
    confirmationState,
    aiServicePort,
    currentDatabaseFilename,
    backendReadOnly,
    setIsScanning,
    setIsConnecting,
    setConnectionStatus,
    setCommandStatus,
    setShowResetConfirm,
    setResetTimeout,
    setConfirmationState,
    setAiServicePort,
    setCurrentDatabaseFilename,
    setBackendReadOnly,
  };
};

export const useSettingsActions = () => {
  const scanPorts = useScanPorts();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const setSelectedPort = useSetSelectedPort();
  const transmit = useTransmit();

  return {
    scanPorts,
    connect,
    disconnect,
    setSelectedPort,
    transmit,
  };
};

// RHF form hooks
export const useCustomCommandForm = () => {
  return useForm<CustomCommandFormData>({
    resolver: zodResolver(customCommandSchema),
    defaultValues: {
      command: "",
    },
  });
};

export const usePortScanning = (
  settingsState: ReturnType<typeof useSettingsState>
) => {
  const { scanPorts } = useSettingsActions();

  const handleScanPorts = async () => {
    settingsState.setIsScanning(true);
    try {
      await scanPorts();
      settingsState.setConnectionStatus("Ports scanned successfully");
    } catch (error) {
      settingsState.setConnectionStatus("Failed to scan ports");
    } finally {
      settingsState.setIsScanning(false);
    }
  };

  useEffect(() => {
    handleScanPorts();
  }, []);

  return { handleScanPorts };
};

export const useConnectionManagement = (
  settingsState: ReturnType<typeof useSettingsState>,
  selectedPort: string | null
) => {
  const { connect, disconnect } = useSettingsActions();

  const handleConnect = async () => {
    if (!selectedPort) {
      settingsState.setConnectionStatus("Please select a port first");
      return;
    }

    settingsState.setIsConnecting(true);
    try {
      const success = await connect(selectedPort);
      if (success) {
        settingsState.setConnectionStatus("Connected successfully");
      } else {
        settingsState.setConnectionStatus("Failed to connect");
      }
    } catch (error) {
      settingsState.setConnectionStatus("Connection error occurred");
    } finally {
      settingsState.setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      settingsState.setConnectionStatus("Disconnected");
    } catch (error) {
      settingsState.setConnectionStatus("Failed to disconnect");
    }
  };

  return { handleConnect, handleDisconnect };
};

export const useCommandManagement = (
  settingsState: ReturnType<typeof useSettingsState>
) => {
  const { transmit } = useSettingsActions();
  const resetStore = useXBeeStore((state) => state.resetStore);

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
      // Special handling for START command - reset GUI first and create new database
      if (command === "START") {
        resetStore();
        settingsState.setCommandStatus("GUI reset for new mission");
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (!settingsState.backendReadOnly) {
          try {
            const newFilename = generateMissionFilename("TEJAS");
            const mcpService = createMCPService(settingsState.aiServicePort);
            await mcpService.createDatabase(newFilename);
            settingsState.setCurrentDatabaseFilename(newFilename);
            settingsState.setCommandStatus(
              `New mission database created: ${newFilename}`
            );
          } catch (error) {
            console.warn("Failed to create mission database:", error);
            settingsState.setCommandStatus(
              "Database creation failed, continuing with command"
            );
          }
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

            if (!settingsState.backendReadOnly) {
              (async () => {
                try {
                  const newFilename = generateMissionFilename("TEJAS");
                  const mcpService = createMCPService(
                    settingsState.aiServicePort
                  );
                  await mcpService.createDatabase(newFilename);
                  settingsState.setCurrentDatabaseFilename(newFilename);
                  settingsState.setCommandStatus(
                    `New mission database created: ${newFilename}`
                  );
                } catch (error) {
                  console.warn(
                    "Failed to create mission database after reset command:",
                    error
                  );
                }
              })();
            }
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
