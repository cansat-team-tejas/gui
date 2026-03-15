import { useTelemetryHistory } from "../../../hooks/use-xbee";
import { getFlightStateName } from "../../../constants";

const FlightDetails = () => {
  const history = useTelemetryHistory();
  const latest = history?.[history.length - 1];

  const missionTime = latest?.MISSION_TIME_S ?? 0;
  const packetCount = latest?.PACKET_COUNT ?? 0;
  const flightState = latest?.FLIGHT_STATE ?? 0;
  const teamId = latest?.TEAM_ID ?? "UNKNOWN";
  const gnssTime = latest?.GNSS_TIME ?? "N/A";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Get flight state color
  const getFlightStateColor = (state: number): string => {
    const colors = [
      "text-gray-600", // IDLE
      "text-green-600", // ASCENT
      "text-orange-600", // DESCENT
      "text-blue-600", // LANDED
      "text-red-600", // ABORT
    ];
    return colors[state] || "text-gray-600";
  };

  return (
    <div className="flex flex-col h-full border border-black bg-white overflow-hidden">
      {/* Header */}
      <div className="px-1 py-0.5 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="text-[9px] font-bold text-black">FLIGHT DETAILS</div>
      </div>

      {/* Content */}
      <div className="flex-1 p-1 grid grid-cols-2 gap-0.5 overflow-hidden auto-rows-min">
        {/* Mission Time */}
        <div className="flex flex-col">
          <span className="text-[7px] text-gray-500">MISSION TIME</span>
          <span className="text-[14px] font-mono font-bold text-black leading-tight">
            {formatTime(missionTime)}
          </span>
          <span className="text-[7px] text-gray-400">
            {missionTime.toFixed(1)}s
          </span>
        </div>

        {/* Packet Count */}
        <div className="flex flex-col">
          <span className="text-[7px] text-gray-500">PACKETS</span>
          <span className="text-[14px] font-mono font-bold text-black leading-tight">
            {packetCount}
          </span>
          <span className="text-[7px] text-gray-400">received</span>
        </div>

        {/* Flight State */}
        <div className="flex flex-col col-span-2">
          <span className="text-[7px] text-gray-500">FLIGHT STATE</span>
          <span
            className={`text-[11px] font-bold leading-tight ${getFlightStateColor(
              flightState
            )}`}
          >
            {getFlightStateName(flightState)}
          </span>
        </div>

        {/* Team ID */}
        <div className="flex flex-col">
          <span className="text-[7px] text-gray-500">TEAM ID</span>
          <span className="text-[10px] font-mono font-semibold text-black leading-tight">
            {teamId}
          </span>
        </div>

        {/* GNSS Time */}
        <div className="flex flex-col">
          <span className="text-[7px] text-gray-500">GNSS TIME</span>
          <span className="text-[8px] font-mono text-black leading-tight">
            {gnssTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
