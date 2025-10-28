import { useTelemetryLatest } from "../../../hooks/use-xbee";
import { FLIGHT_STATES } from "../../../constants";

const EnvironmentalPanel = () => {
  const latest = useTelemetryLatest();

  // Environmental Data
  const temperature = latest?.TEMPERATURE ?? 0;
  const pressure = latest?.PRESSURE ?? 0;
  const humidity = latest?.HUMIDITY ?? 0;
  const mcuTemp = latest?.MCU_TEMP_C ?? 0;
  // Battery percentage calculation for 3S LiPo (9.0V = 0%, 12.6V = 100%)
  const voltage = latest?.VOLTAGE ?? 0;
  const batteryPercent = Math.max(
    0,
    Math.min(100, ((voltage - 9.0) / (12.6 - 9.0)) * 100)
  );

  // Helper function to get temperature color
  const getTempColor = (temp: number): string => {
    if (temp > 35) return "#dc2626"; // Hot - red
    if (temp > 25) return "#f97316"; // Warm - orange
    if (temp > 15) return "#22c55e"; // Normal - green
    if (temp > 5) return "#3b82f6"; // Cool - blue
    return "#6366f1";
  };

  return (
    <div className="flex flex-col h-full border border-black bg-white overflow-hidden">
      {/* Header */}
      <div className="px-1 py-0.5 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="text-[9px] font-bold text-black">ENVIRONMENT</div>
      </div>

      {/* Content */}
      <div className="flex-1 p-1 flex flex-col gap-1 overflow-hidden min-h-0">
        {/* Battery Percentage - follow IMU compact block style */}
        <div
          className={`flex items-center justify-between bg-gradient-to-r ${
            batteryPercent < 20
              ? "from-red-50 to-red-100 border border-red-300"
              : batteryPercent < 50
              ? "from-yellow-50 to-yellow-100 border border-yellow-300"
              : "from-green-50 to-green-100 border border-green-300"
          } rounded px-2 py-1 flex-shrink-0`}
        >
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-600 font-bold uppercase">
              Battery
            </span>
            <div className="flex-1 w-[140px] h-3.5 bg-gray-200 rounded overflow-hidden relative border border-gray-300">
              <div
                className={`h-full transition-all duration-300 ${
                  batteryPercent < 20
                    ? "bg-red-500"
                    : batteryPercent < 50
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
                style={{ width: `${batteryPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-[18px] font-mono font-bold leading-none ${
                batteryPercent < 20
                  ? "text-red-600"
                  : batteryPercent < 50
                  ? "text-yellow-600"
                  : "text-green-700"
              }`}
            >
              {batteryPercent.toFixed(0)}
            </span>
            <span className="text-[8px] text-gray-600 font-semibold">%</span>
          </div>
        </div>
        {/* Rollback: keep a single battery block (no icon) */}
        {/* Flight State - Prominent Section */}
        <div className="bg-[#D9D9D9] border border-black rounded-none px-2 py-1 mb-2">
          <div className="flex items-center">
            <div className="flex items-center border border-black text-[12px] font-bold bg-[#00AD57] text-white px-4 h-[25px]">
              {typeof latest?.FLIGHT_STATE === "number"
                ? FLIGHT_STATES[
                    latest.FLIGHT_STATE as keyof typeof FLIGHT_STATES
                  ]
                : "FLIGHT MODE"}
            </div>
          </div>
        </div>
        {/* Temperature Row - Compact side by side (rolled back to DS blocks) */}
        <div className="grid grid-cols-2 gap-1 flex-shrink-0">
          {/* Ambient Temperature */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded p-1.5">
            <div className="text-[8px] text-gray-600 font-bold uppercase mb-0.5">
              Ambient
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-[12px] font-mono font-bold leading-tight"
                style={{ color: getTempColor(temperature) }}
              >
                {temperature.toFixed(1)}
              </span>
              <span className="text-[8px] text-gray-600 font-semibold">°C</span>
            </div>
          </div>

          {/* MCU Temperature */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 rounded p-1.5">
            <div className="text-[8px] text-gray-600 font-bold uppercase mb-0.5">
              MCU Temp
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[12px] font-mono font-bold text-orange-600 leading-tight">
                {mcuTemp.toFixed(1)}
              </span>
              <span className="text-[8px] text-gray-600 font-semibold">°C</span>
            </div>
          </div>
        </div>

        {/* Pressure and Humidity Grid (rolled back to DS blocks) */}
        <div className="grid grid-cols-2 gap-1 flex-shrink-0">
          {/* Pressure */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded p-1.5">
            <div className="text-[8px] text-gray-600 font-bold uppercase mb-0.5">
              Pressure
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[12px] font-mono font-bold text-purple-700 leading-tight">
                {pressure.toFixed(0)}
              </span>
              <span className="text-[8px] text-gray-600 font-semibold">
                hPa
              </span>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-300 rounded p-1.5">
            <div className="text-[8px] text-gray-600 font-bold uppercase mb-0.5">
              Humidity
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[12px] font-mono font-bold text-cyan-700 leading-tight">
                {humidity.toFixed(1)}
              </span>
              <span className="text-[8px] text-gray-600 font-semibold">%</span>
            </div>
          </div>
        </div>

        {/* Altitude display removed. */}
      </div>
    </div>
  );
};

export default EnvironmentalPanel;
