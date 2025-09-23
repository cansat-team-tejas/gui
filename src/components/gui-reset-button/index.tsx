import React, { useState } from "react";
import Button from "../button";

interface GuiResetButtonProps {
  className?: string;
}

export const GuiResetButton: React.FC<GuiResetButtonProps> = ({
  className = "",
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setShowConfirm(true);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);

    try {
      // Clear all localStorage data
      localStorage.clear();

      // Clear sessionStorage data
      sessionStorage.clear();

      // Reset application state by reloading
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to reset GUI:", error);
      setIsResetting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-[10px] font-bold text-red-600 text-center">
          CONFIRM RESET
        </div>
        <div className="text-[9px] text-gray-700 text-center mb-2">
          This will clear all data and reload the application.
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleConfirmReset}
            variant="warning"
            disabled={isResetting}
            className="flex-1 text-[9px] h-[25px]"
          >
            {isResetting ? "RESETTING..." : "CONFIRM"}
          </Button>
          <Button
            onClick={handleCancel}
            variant="default"
            disabled={isResetting}
            className="flex-1 text-[9px] h-[25px]"
          >
            CANCEL
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleReset}
      variant="warning"
      className={`w-full text-[10px] h-[25px] ${className}`}
    >
      RESET GUI
    </Button>
  );
};
