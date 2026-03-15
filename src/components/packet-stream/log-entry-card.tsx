import type { ILogEntryType } from "../../types/telemetry";
import { parseLogMessage } from "../../constants/log-constants";

const CATEGORY_COLORS: Record<string, string> = {
  SYSTEM: "bg-blue-100 text-blue-800",
  FLIGHT_STATES: "bg-purple-100 text-purple-800",
  PARACHUTE: "bg-red-100 text-red-800",
  GPS: "bg-green-100 text-green-800",
  IMU: "bg-indigo-100 text-indigo-800",
  POWER: "bg-yellow-100 text-yellow-800",
  COMMUNICATION: "bg-cyan-100 text-cyan-800",
  SD_CARD: "bg-gray-100 text-gray-800",
  CALIBRATION: "bg-pink-100 text-pink-800",
};

interface Props {
  data: ILogEntryType;
  formatTime: (t: Date) => string;
  formatMissionTime: (t: string) => string;
}

const LogEntryCard = ({ data, formatTime, formatMissionTime }: Props) => {
  const parsedLog = parseLogMessage(data.MESSAGE || "");
  const categoryColor =
    CATEGORY_COLORS[parsedLog.category] || "bg-gray-100 text-gray-800";

  return (
    <div className="border-2 rounded-sm shadow-sm overflow-hidden border-[#FFAB00] bg-orange-50">
      <div className="px-3 py-2 flex justify-between items-center bg-[#FFAB00] text-white">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-wide">LOG</span>
          <span className="text-[10px] opacity-90">
            {formatTime(data.timestamp)}
          </span>
        </div>
        <span className="text-[10px] font-bold opacity-90">
          MISSION: {formatMissionTime(data.MISSION_TIME)}
        </span>
      </div>

      <div className="px-3 py-2 bg-white">
        {parsedLog.isSystemLog ? (
          <SystemLogContent parsedLog={parsedLog} categoryColor={categoryColor} />
        ) : (
          <div className="text-[11px] font-semibold text-gray-900 leading-tight">
            {parsedLog.meaning}
          </div>
        )}
      </div>

      <div className="px-3 py-1 bg-gray-100 border-t border-gray-200">
        <span className="text-[9px] font-medium text-gray-600">
          TEAM: {data.TEAM_ID || "N/A"}
        </span>
      </div>
    </div>
  );
};

interface SystemLogProps {
  parsedLog: ReturnType<typeof parseLogMessage>;
  categoryColor: string;
}

const SystemLogContent = ({ parsedLog, categoryColor }: SystemLogProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-[9px] font-bold ${categoryColor}`}>
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

    <div className="text-[11px] font-semibold text-gray-900 leading-relaxed">
      {(parsedLog as any).isMultiEntry ? (
        <MultiEntryLog meaning={parsedLog.meaning} entries={(parsedLog as any).entries} />
      ) : (
        <div>{parsedLog.meaning}</div>
      )}
    </div>

    <details className="text-[9px] text-gray-500">
      <summary className="cursor-pointer hover:text-gray-700">
        Raw Message
      </summary>
      <div className="mt-1 font-mono bg-gray-50 p-2 rounded text-[8px] border">
        {parsedLog.originalMessage}
      </div>
    </details>
  </div>
);

interface MultiEntryProps {
  meaning: string;
  entries: any[];
}

const MultiEntryLog = ({ meaning, entries }: MultiEntryProps) => (
  <div className="space-y-1">
    <div className="text-[10px] font-bold text-blue-700 mb-2">
      System Event Sequence ({entries?.length || 0} events)
    </div>
    {meaning.split(" | ").map((group, idx) => (
      <div key={idx} className="pl-4 border-l-2 border-gray-200">
        <div className="text-[10px] font-medium text-gray-800">{group}</div>
      </div>
    ))}
  </div>
);

export default LogEntryCard;
