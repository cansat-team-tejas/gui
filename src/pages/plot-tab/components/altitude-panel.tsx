import { useTelemetryHistory } from "../../../hooks/use-xbee";
import { useMemo } from "react";

const EnvironmentalPanel = () => {
  const history = useTelemetryHistory();
  const latest = history?.[history.length - 1];

  const pressure = latest?.PRESSURE ?? 0;
  const temperature = latest?.TEMPERATURE ?? 0;
  const humidity = latest?.HUMIDITY ?? 0;

  // Calculate ascent/descent rate using rolling average (last 3 points)
  const ascentRate = useMemo(() => {
    if (!history || history.length < 3) return 0;
    const recentPoints = history.slice(-3);
    let totalRate = 0;

    for (let i = 1; i < recentPoints.length; i++) {
      const altDiff =
        (recentPoints[i]?.ALTITUDE || 0) - (recentPoints[i - 1]?.ALTITUDE || 0);
      const timeDiff =
        (recentPoints[i]?.MISSION_TIME_S || 0) -
        (recentPoints[i - 1]?.MISSION_TIME_S || 0);
      if (timeDiff > 0) {
        totalRate += altDiff / timeDiff;
      }
    }

    return totalRate / (recentPoints.length - 1);
  }, [history]);

  // Get ascent rate color and direction
  const getAscentRateColor = (rate: number): string => {
    if (rate > 0.5) return "text-green-600";
    if (rate < -0.5) return "text-orange-600";
    return "text-gray-600";
  };

  const getAscentRateArrow = (rate: number): string => {
    if (rate > 0.5) return "↑";
    if (rate < -0.5) return "↓";
    return "→";
  };

  return (
    <div className="flex flex-col h-full border border-black bg-white overflow-hidden">
      {/* Header */}
      <div className="px-1 py-0.5 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="text-[9px] font-bold text-black">ENVIRONMENT</div>
      </div>

      {/* Content */}
      <div className="flex-1 p-1 overflow-hidden">
        {/* Environmental Metrics Grid */}
        <div className="grid grid-cols-2 gap-0.5 h-full">
          {/* Ascent Rate */}
          <div className="flex flex-col bg-gray-50 border border-gray-200 rounded p-0.5">
            <span className="text-[7px] text-gray-500">RATE</span>
            <span
              className={`text-[10px] font-mono font-bold leading-tight ${getAscentRateColor(
                ascentRate
              )}`}
            >
              {getAscentRateArrow(ascentRate)} {Math.abs(ascentRate).toFixed(1)}
            </span>
            <span className="text-[6px] text-gray-400">m/s</span>
          </div>

          {/* Temperature */}
          <div className="flex flex-col bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded p-1 items-center justify-center">
            <span className="text-[7px] text-gray-500 mb-0.5">TEMPERATURE</span>
            <span className="text-[14px] font-mono font-bold text-red-600 leading-none">
              {temperature.toFixed(1)}
            </span>
            <span className="text-[7px] text-gray-400">°C</span>
          </div>

          {/* Pressure */}
          <div className="flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded p-1 items-center justify-center">
            <span className="text-[7px] text-gray-500 mb-0.5">PRESSURE</span>
            <span className="text-[14px] font-mono font-bold text-purple-600 leading-none">
              {pressure.toFixed(0)}
            </span>
            <span className="text-[7px] text-gray-400">Pa</span>
          </div>

          {/* Humidity */}
          <div className="flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded p-1 items-center justify-center col-span-2">
            <span className="text-[7px] text-gray-500 mb-0.5">HUMIDITY</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[16px] font-mono font-bold text-cyan-600 leading-none">
                {humidity.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalPanel;
