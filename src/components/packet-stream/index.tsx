import React, { useEffect, useRef } from "react";
import { useXBeeStore, xbeeSelectors } from "../../store/xbee";
import type { ICommandType, ILogEntryType } from "../../types/telemetry";
import {
  parseLogMessage,
  getLogDisplayMessage,
} from "../../constants/log-constants";

interface PacketStreamViewProps {
  searchTerm?: string;
  showCommands?: boolean;
  showLogs?: boolean;
  autoScroll?: boolean;
}

const PacketStreamView: React.FC<PacketStreamViewProps> = ({
  searchTerm = "",
  showCommands = true,
  showLogs = true,
  autoScroll = true,
}) => {
  const commandEchoHistory = useXBeeStore(xbeeSelectors.commandEchoHistory);
  const logEntries = useXBeeStore(xbeeSelectors.logEntries);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Combine logs and commands into a single stream sorted by timestamp
  const allEntries = React.useMemo(() => {
    const combined: Array<{
      type: "command" | "log";
      timestamp: Date;
      data: ICommandType | ILogEntryType;
    }> = [];

    // Add commands if enabled
    if (showCommands) {
      commandEchoHistory.forEach((cmd: ICommandType) => {
        combined.push({
          type: "command",
          timestamp: cmd.timestamp,
          data: cmd,
        });
      });
    }

    // Add logs if enabled
    if (showLogs) {
      logEntries.forEach((log: ILogEntryType) => {
        combined.push({
          type: "log",
          timestamp: log.timestamp,
          data: log,
        });
      });
    }

    // Filter by search term
    let filtered = combined;
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = combined.filter((entry) => {
        if (entry.type === "command") {
          const cmd = entry.data as ICommandType;
          return (
            cmd.COMMAND_ECHO?.toLowerCase().includes(lowerSearch) ||
            cmd.TEAM_ID?.toLowerCase().includes(lowerSearch)
          );
        } else {
          const log = entry.data as ILogEntryType;
          return (
            log.MESSAGE?.toLowerCase().includes(lowerSearch) ||
            log.TEAM_ID?.toLowerCase().includes(lowerSearch)
          );
        }
      });
    }

    // Sort by timestamp (newest first)
    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [commandEchoHistory, logEntries, showCommands, showLogs, searchTerm]);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allEntries, autoScroll]);

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SYSTEM":
        return "bg-blue-100 text-blue-800";
      case "FLIGHT_STATES":
        return "bg-purple-100 text-purple-800";
      case "PARACHUTE":
        return "bg-red-100 text-red-800";
      case "GPS":
        return "bg-green-100 text-green-800";
      case "IMU":
        return "bg-indigo-100 text-indigo-800";
      case "POWER":
        return "bg-yellow-100 text-yellow-800";
      case "COMMUNICATION":
        return "bg-cyan-100 text-cyan-800";
      case "SD_CARD":
        return "bg-gray-100 text-gray-800";
      case "CALIBRATION":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatMissionTime = (missionTime: string) => {
    return missionTime || "N/A";
  };

  return (
    <div className="flex-1 flex flex-col border border-black bg-white overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-auto p-1">
        {allEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-[#D9D9D9] text-black px-2 py-1 text-[10px] font-bold border border-black">
              {searchTerm
                ? `NO ENTRIES MATCH "${searchTerm.toUpperCase()}"`
                : "NO LOGS OR COMMANDS RECEIVED"}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {allEntries.map((entry, index) => (
              <div
                key={`${entry.type}-${index}`}
                className={`border-2 rounded-sm shadow-sm overflow-hidden ${
                  entry.type === "command"
                    ? "border-[#00AD57] bg-green-50"
                    : "border-[#FFAB00] bg-orange-50"
                }`}
              >
                {/* Header with type badge and timestamp */}
                <div
                  className={`px-3 py-2 flex justify-between items-center ${
                    entry.type === "command"
                      ? "bg-[#00AD57] text-white"
                      : "bg-[#FFAB00] text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold tracking-wide">
                      {entry.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] opacity-90">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold opacity-90">
                    MISSION: {formatMissionTime(entry.data.MISSION_TIME)}
                  </span>
                </div>

                {/* Content */}
                <div className="px-3 py-2 bg-white">
                  {entry.type === "command" ? (
                    <div className="text-[11px] font-semibold text-gray-900 leading-tight">
                      <span>{(entry.data as ICommandType).COMMAND_ECHO}</span>
                    </div>
                  ) : (
                    (() => {
                      const logData = entry.data as ILogEntryType;
                      const message = logData.MESSAGE || "";
                      const parsedLog = parseLogMessage(message);

                      return (
                        <div className="space-y-2">
                          {parsedLog.isSystemLog ? (
                            <>
                              {/* Header with symbol and timestamp info */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-1 rounded text-[9px] font-bold ${getCategoryColor(
                                      parsedLog.category
                                    )}`}
                                  >
                                    {parsedLog.category.replace("_", " ")}
                                  </span>
                                  <span className="text-[10px] text-gray-600 font-mono">
                                    Symbol: {parsedLog.symbol}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  Time: {parsedLog.timestamp}
                                </span>
                              </div>

                              {/* Main meaning display */}
                              <div className="text-[11px] font-semibold text-gray-900 leading-relaxed">
                                {(parsedLog as any).isMultiEntry ? (
                                  <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-blue-700 mb-2">
                                      📋 System Event Sequence (
                                      {(parsedLog as any).entries?.length || 0}{" "}
                                      events)
                                    </div>
                                    {parsedLog.meaning
                                      .split(" | ")
                                      .map((categoryGroup, idx) => (
                                        <div
                                          key={idx}
                                          className="pl-4 border-l-2 border-gray-200"
                                        >
                                          <div className="text-[10px] font-medium text-gray-800">
                                            {categoryGroup}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div>
                                    {getLogDisplayMessage(
                                      parsedLog.symbol || ""
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Show raw message as expandable detail */}
                              <details className="text-[9px] text-gray-500">
                                <summary className="cursor-pointer hover:text-gray-700">
                                  Raw Message
                                </summary>
                                <div className="mt-1 font-mono bg-gray-50 p-2 rounded text-[8px] border">
                                  {parsedLog.originalMessage}
                                </div>
                              </details>
                            </>
                          ) : (
                            <div className="text-[11px] font-semibold text-gray-900 leading-tight">
                              {parsedLog.meaning}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Footer */}
                <div className="px-3 py-1 bg-gray-100 border-t border-gray-200">
                  <span className="text-[9px] font-medium text-gray-600">
                    TEAM: {entry.data.TEAM_ID || "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PacketStreamView;
