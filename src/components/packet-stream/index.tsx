import React, { useEffect, useRef } from "react";
import { useXBeeStore, xbeeSelectors } from "../../store/xbee";
import type { ICommandType, ILogEntryType } from "../../types/telemetry";
import CommandEntry from "./command-entry";
import LogEntryCard from "./log-entry-card";

interface PacketStreamViewProps {
  searchTerm?: string;
  showCommands?: boolean;
  showLogs?: boolean;
  autoScroll?: boolean;
}

type StreamEntry = {
  type: "command" | "log";
  timestamp: Date;
  data: ICommandType | ILogEntryType;
};

const formatTime = (timestamp: Date) =>
  timestamp.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatMissionTime = (missionTime: string) => missionTime || "N/A";

const PacketStreamView: React.FC<PacketStreamViewProps> = ({
  searchTerm = "",
  showCommands = true,
  showLogs = true,
  autoScroll = true,
}) => {
  const commandEchoHistory = useXBeeStore(xbeeSelectors.commandEchoHistory);
  const logEntries = useXBeeStore(xbeeSelectors.logEntries);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allEntries = React.useMemo(() => {
    const combined: StreamEntry[] = [];

    if (showCommands) {
      commandEchoHistory.forEach((cmd: ICommandType) => {
        combined.push({ type: "command", timestamp: cmd.timestamp, data: cmd });
      });
    }

    if (showLogs) {
      logEntries.forEach((log: ILogEntryType) => {
        combined.push({ type: "log", timestamp: log.timestamp, data: log });
      });
    }

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
        }
        const log = entry.data as ILogEntryType;
        return (
          log.MESSAGE?.toLowerCase().includes(lowerSearch) ||
          log.TEAM_ID?.toLowerCase().includes(lowerSearch)
        );
      });
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [commandEchoHistory, logEntries, showCommands, showLogs, searchTerm]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allEntries, autoScroll]);

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
            {allEntries.map((entry, index) =>
              entry.type === "command" ? (
                <CommandEntry
                  key={`cmd-${index}`}
                  data={entry.data as ICommandType}
                  formatTime={formatTime}
                  formatMissionTime={formatMissionTime}
                />
              ) : (
                <LogEntryCard
                  key={`log-${index}`}
                  data={entry.data as ILogEntryType}
                  formatTime={formatTime}
                  formatMissionTime={formatMissionTime}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PacketStreamView;
