import type { ICommandType } from "../../types/telemetry";

interface Props {
  data: ICommandType;
  formatTime: (t: Date) => string;
  formatMissionTime: (t: string) => string;
}

const CommandEntry = ({ data, formatTime, formatMissionTime }: Props) => (
  <div className="border-2 rounded-sm shadow-sm overflow-hidden border-[#00AD57] bg-green-50">
    <div className="px-3 py-2 flex justify-between items-center bg-[#00AD57] text-white">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold tracking-wide">COMMAND</span>
        <span className="text-[10px] opacity-90">
          {formatTime(data.timestamp)}
        </span>
      </div>
      <span className="text-[10px] font-bold opacity-90">
        MISSION: {formatMissionTime(data.MISSION_TIME)}
      </span>
    </div>

    <div className="px-3 py-2 bg-white">
      <div className="text-[11px] font-semibold text-gray-900 leading-tight">
        {data.COMMAND_ECHO}
      </div>
    </div>

    <div className="px-3 py-1 bg-gray-100 border-t border-gray-200">
      <span className="text-[9px] font-medium text-gray-600">
        TEAM: {data.TEAM_ID || "N/A"}
      </span>
    </div>
  </div>
);

export default CommandEntry;
