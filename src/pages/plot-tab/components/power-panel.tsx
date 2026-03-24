import { useTelemetryHistory } from "../../../hooks/use-xbee";

const PowerPanel = () => {
  const history = useTelemetryHistory();
  const latest = history?.[history.length - 1];

  const voltage = latest?.VOLTAGE ?? 0;
  const current = latest?.CURRENT ?? 0;
  const power = latest?.POWER ?? 0;

  // Calculate battery percentage for 2S LiPo (7.4V nominal, 6.6V min, 8.4V max)
  const getBatteryPercentage = (v: number): number => {
    if (v === 0) return 0; // Handle completely disconnected/dead state
    const minVoltage = 6.6;
    const maxVoltage = 8.4;
    const percentage = ((v - minVoltage) / (maxVoltage - minVoltage)) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  const batteryPercentage = getBatteryPercentage(voltage);

  // Get battery color based on percentage
  const getBatteryColor = (percentage: number): string => {
    if (percentage > 50) return "bg-green-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col h-full border border-black bg-white overflow-hidden">
      {/* Header */}
      <div className="px-1 py-0.5 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="text-[9px] font-bold text-black">POWER</div>
      </div>

      {/* Content */}
      <div className="flex-1 p-1 flex flex-col gap-0.5 overflow-hidden">
        {/* Battery Visualization */}
        <div className="flex flex-col flex-shrink-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[8px] text-gray-500">BATTERY</span>
            <span className="text-[10px] font-bold text-black">
              {batteryPercentage.toFixed(0)}% • {voltage.toFixed(2)}V
            </span>
          </div>

          {/* Battery Icon with Fill */}
          <div className="relative w-full h-5 flex items-center justify-center">
            {/* Battery body */}
            <div className="w-[90%] h-3.5 border-2 border-gray-800 rounded bg-white relative overflow-hidden">
              {/* Fill */}
              <div
                className={`h-full ${getBatteryColor(
                  batteryPercentage
                )} transition-all duration-300 ${
                  batteryPercentage < 20 ? "animate-pulse" : ""
                }`}
                style={{ width: `${batteryPercentage}%` }}
              />
            </div>
            {/* Battery terminal */}
            <div className="w-[5%] h-2 bg-gray-800 rounded-r"></div>
          </div>
        </div>

        {/* Power Metrics Grid - Removed duplicate voltage */}
        <div className="grid grid-cols-2 gap-0.5 flex-1 min-h-0">
          {/* Current */}
          <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded p-0.5">
            <span className="text-[7px] text-gray-500">CURRENT</span>
            <span className="text-[11px] font-mono font-bold text-blue-600 leading-tight">
              {current.toFixed(2)}
            </span>
            <span className="text-[7px] text-gray-400">A</span>
          </div>

          {/* Power */}
          <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded p-0.5">
            <span className="text-[7px] text-gray-500">POWER</span>
            <span className="text-[11px] font-mono font-bold text-purple-600 leading-tight">
              {power.toFixed(1)}
            </span>
            <span className="text-[7px] text-gray-400">W</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerPanel;
