/**
 * Command Categories Component
 * Displays categorized command buttons
 */
import React from "react";
import type { Command } from "../types";

interface CommandCategoryProps {
  title: string;
  commands: Command[];
  type: "system" | "emergency" | "calibration" | "flight" | "sdcard";
  onSendCommand: (command: string) => void;
}

const CommandCategory: React.FC<CommandCategoryProps> = ({
  title,
  commands,
  type,
  onSendCommand,
}) => {
  const getButtonStyles = () => {
    switch (type) {
      case "emergency":
        return "bg-red-500 border border-red-700 text-white hover:bg-red-600";
      default:
        return "bg-[rgba(217,217,217,0.5)] border border-[rgba(0,0,0,0.58)] text-[rgba(0,0,0,0.65)] hover:bg-[rgba(217,217,217,0.8)]";
    }
  };

  const getTitleStyles = () => {
    switch (type) {
      case "emergency":
        return "text-red-600";
      default:
        return "text-[#666]";
    }
  };

  return (
    <div className="space-y-1">
      <div className={`text-[9px] font-bold ${getTitleStyles()}`}>
        {type === "emergency" && "⚠️ "}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {commands.map((cmd, index) => (
          <button
            key={index}
            onClick={() => onSendCommand(cmd.command)}
            className={`rounded-[2px] px-2 py-[6px] h-[32px] w-[131px] text-[13px] font-medium transition-colors ${getButtonStyles()}`}
            title={cmd.command}
          >
            {cmd.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommandCategory;
