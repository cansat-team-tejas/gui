import { useTelemetryHistory } from "../../hooks/use-xbee";

const DataStatusDisplay = () => {
  const telemetryHistory = useTelemetryHistory();
  const length = telemetryHistory.length;
  return (
    <div className="flex gap-2 items-center">
      <div className="bg-[#00AD57] text-white px-2 py-1 text-[10px] font-bold h-max">
        SHOWING {length} OF {length} ROWS
      </div>
    </div>
  );
};

export default DataStatusDisplay;
