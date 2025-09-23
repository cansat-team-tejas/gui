/**
 * Settings page hooks
 * Custom hooks for settings functionality using RHF and Zod
 */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsState, CustomCommandFormData, QnhFormData } from "./types";
import { customCommandSchema, qnhSchema } from "./schemas";
import { QNH_DEFAULTS, TIMEOUTS } from "./constants";
import {
  useScanPorts,
  useConnect,
  useDisconnect,
  useSetSelectedPort,
  useTransmit,
} from "../../hooks/use-xbee";

export const useSettingsState = (): SettingsState & {
  setIsScanning: (scanning: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionStatus: (status: string) => void;
  setCommandStatus: (status: string) => void;
  setShowResetConfirm: (show: boolean) => void;
  setResetTimeout: (timeout: NodeJS.Timeout | null) => void;
} => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [commandStatus, setCommandStatus] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout | null>(null);

  return {
    isScanning,
    isConnecting,
    connectionStatus,
    commandStatus,
    showResetConfirm,
    resetTimeout,
    setIsScanning,
    setIsConnecting,
    setConnectionStatus,
    setCommandStatus,
    setShowResetConfirm,
    setResetTimeout,
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

export const useQnhForm = () => {
  return useForm<QnhFormData>({
    resolver: zodResolver(qnhSchema),
    defaultValues: {
      qnh: QNH_DEFAULTS.DEFAULT_VALUE,
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

  // Scan for ports on hook initialization
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

  const handleSendCommand = async (command: string) => {
    if (!command.trim()) return;

    try {
      const success = await transmit(command);
      if (success) {
        settingsState.setCommandStatus(`Command sent: ${command}`);
      } else {
        settingsState.setCommandStatus("Failed to send command");
      }
    } catch (error) {
      settingsState.setCommandStatus("Command transmission error");
    }
  };

  const handleResetRequest = async () => {
    await handleSendCommand("RESET");
    settingsState.setShowResetConfirm(true);

    // Set timeout for reset confirmation
    const timeout = setTimeout(() => {
      settingsState.setShowResetConfirm(false);
      settingsState.setCommandStatus("Reset confirmation timeout");
    }, TIMEOUTS.RESET_CONFIRM);

    settingsState.setResetTimeout(timeout);
  };

  const handleResetConfirm = async () => {
    if (settingsState.resetTimeout) {
      clearTimeout(settingsState.resetTimeout);
      settingsState.setResetTimeout(null);
    }
    settingsState.setShowResetConfirm(false);
    await handleSendCommand("RESET_CONFIRM");
  };

  const handleQnhSet = async (qnhValue: string) => {
    await handleSendCommand(`QNH:${qnhValue}`);
  };

  return {
    handleSendCommand,
    handleResetRequest,
    handleResetConfirm,
    handleQnhSet,
  };
};
