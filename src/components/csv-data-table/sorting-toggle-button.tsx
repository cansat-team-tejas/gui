/**
 * Sorting Toggle Button Component
 * Allows users to enable/disable table sorting functionality
 * Follows design system guidelines
 */
import { memo } from "react";

interface SortingToggleButtonProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export const SortingToggleButton = memo<SortingToggleButtonProps>(
  ({ enabled, onToggle, className = "" }) => {
    return (
      <button
        onClick={() => onToggle(!enabled)}
        className={`
          flex items-center gap-1 px-2 py-1
          border border-black bg-[#D9D9D9]
          text-[9px] font-bold text-black
          transition-colors duration-150
          hover:bg-gray-300 active:bg-gray-400
          ${
            enabled
              ? "bg-[#00AD57] text-white border-[#00AD57] hover:bg-green-600"
              : ""
          }
          ${className}
        `}
        title={enabled ? "Disable column sorting" : "Enable column sorting"}
      >
        {/* Toggle indicator */}
        <div
          className={`
          w-2 h-2 border border-black flex items-center justify-center
          transition-colors duration-150
          ${enabled ? "bg-white" : "bg-transparent"}
        `}
        >
          {enabled && <div className="w-1 h-1 bg-[#00AD57]" />}
        </div>

        {/* Label */}
        <span>{enabled ? "SORT" : "SORT"}</span>
      </button>
    );
  }
);

SortingToggleButton.displayName = "SortingToggleButton";
