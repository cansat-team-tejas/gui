/**
 * Command Categories Component
 * Displays categorized command buttons
 */
import React from "react";
import { AlertTriangle } from "lucide-react";
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
        return "bg-[rgba(217,217,217,0.5)] border border-[rgba(0,0,0,1)] text-[rgba(0,0,0,1)] hover:bg-[rgba(217,217,217,0.8)]";
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
      <div className={`text-[9px] font-bold flex items-center gap-1 ${getTitleStyles()}`}>
        {type === "emergency" && <AlertTriangle size={10} />}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {commands.map((cmd, index) => (
          <button
            key={index}
            onClick={() => onSendCommand(cmd.command)}
            className={`px-5 py-1 w-max text-[12px] font-bold transition-colors ${getButtonStyles()}`}
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
