import React, { useState } from "react";
import Button from "../button";
import ConfirmationDialog from "../confirmation-dialog";
import { useXBeeStore } from "../../store/xbee";
import { useSettingsState } from "../../pages/settings/hooks";
import {
  createMCPService,
  generateMissionFilename,
} from "../../utils/mcp-service";

interface GuiResetButtonProps {
  className?: string;
}

export const GuiResetButton: React.FC<GuiResetButtonProps> = ({
  className = "",
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const resetStore = useXBeeStore((state) => state.resetStore);
  const settingsState = useSettingsState();

  const handleReset = () => {
    setShowConfirm(true);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);

    try {
      // Reset the Zustand store state
      resetStore();

      // Clear all localStorage data
      localStorage.clear();

      // Clear sessionStorage data
      sessionStorage.clear();

      // Create a fresh mission database and set it active
      try {
        const newFilename = generateMissionFilename("TEJAS");
        const mcpService = createMCPService(settingsState.aiServicePort);
        await mcpService.createDatabase(newFilename);
        settingsState.setCurrentDatabaseFilename(newFilename);
      } catch (e) {
        console.warn("Failed to create mission database on GUI reset:", e);
      }
    } catch (error) {
      console.error("Failed to reset GUI:", error);
    }

    setIsResetting(false);
    setShowConfirm(false);
  };

  const handleCancelReset = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        onClick={handleReset}
        variant="warning"
        className={`w-full text-[10px] h-[25px] ${className}`}
        disabled={isResetting}
      >
        {isResetting ? "RESETTING..." : "RESET GUI"}
      </Button>

      <ConfirmationDialog
        isOpen={showConfirm}
        title="RESET GUI DATA"
        message="This will clear all telemetry history, logs, statistics, and application data. The application will be reset to its initial state. This action cannot be undone."
        confirmText={isResetting ? "RESETTING..." : "Reset GUI"}
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </>
  );
};
