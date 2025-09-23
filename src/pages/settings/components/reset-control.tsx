/**
 * Reset Control Component
 * Handles reset command with confirmation
 */
import React from "react";

interface ResetControlProps {
  showResetConfirm: boolean;
  onResetRequest: () => void;
  onResetConfirm: () => void;
}

const ResetControl: React.FC<ResetControlProps> = ({
  showResetConfirm,
  onResetRequest,
  onResetConfirm,
}) => {
  return (
    <div className="space-y-1">
      <div className="text-[9px] font-bold text-red-600">RESET CONTROL</div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onResetRequest}
          disabled={showResetConfirm}
          className={`rounded-[2px] px-2 py-[6px] h-[32px] w-[131px] text-[13px] font-medium transition-colors ${
            showResetConfirm
              ? "bg-[rgba(217,217,217,0.5)] border border-[rgba(0,0,0,0.58)] text-[rgba(0,0,0,0.65)] cursor-not-allowed"
              : "bg-red-500 border border-red-700 text-white hover:bg-red-600"
          }`}
          title="RESET"
        >
          RESET
        </button>
        {showResetConfirm && (
          <button
            onClick={onResetConfirm}
            className="bg-red-700 border border-red-900 rounded-[2px] px-2 py-[6px] h-[32px] w-[131px] text-[13px] font-medium text-white hover:bg-red-800 transition-colors animate-pulse"
            title="RESET_CONFIRM"
          >
            ⚠️ CONFIRM
          </button>
        )}
      </div>
    </div>
  );
};

export default ResetControl;
