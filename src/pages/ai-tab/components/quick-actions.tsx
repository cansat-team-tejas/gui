import React, { memo } from "react";

interface QuickActionsProps {
  onActionSelect: (action: string) => void;
  isProcessing: boolean;
}

const QUICK_ACTIONS = [
  "STATUS",
  "START",
  "ALT",
  "STOP",
  "TELEM",
  "GPS",
] as const;

const QuickActions: React.FC<QuickActionsProps> = memo(
  ({ onActionSelect, isProcessing }) => {
    const actionMap: Record<string, string> = {
      STATUS: "What's the current status?",
      START: "Start the CanSat",
      ALT: "Check altitude",
      STOP: "Emergency stop",
      TELEM: "Show telemetry data",
      GPS: "Check GPS coordinates",
    };

    return (
      <div className="border-t border-black bg-[#D9D9D9] px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="text-[8px] font-bold text-black">QUICK:</div>
          <div className="flex gap-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => onActionSelect(actionMap[action])}
                className="text-[7px] px-1 py-0.5 h-4 bg-white border border-black hover:bg-[#00AD57] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
                disabled={isProcessing}
                title={actionMap[action]}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

QuickActions.displayName = "QuickActions";

export default QuickActions;
