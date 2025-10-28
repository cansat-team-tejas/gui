import { useTelemetryLatest } from "../../../hooks/use-xbee";

const MotionPanel = () => {
  const latest = useTelemetryLatest();

  // IMU Data
  const accelX = latest?.ACCEL_X ?? 0;
  const accelY = latest?.ACCEL_Y ?? 0;
  const accelZ = latest?.ACCEL_Z ?? 0;
  const gyroX = latest?.GYRO_X ?? 0;
  const gyroY = latest?.GYRO_Y ?? 0;
  const gyroZ = latest?.GYRO_Z ?? 0;
  const rssi = latest?.RSSI_DBM ?? 0;

  // Calculate total acceleration magnitude (G-force)
  const totalAccel = Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);

  // Get color based on G-force
  const getAccelColor = (g: number): string => {
    if (g > 3) return "#dc2626";
    if (g > 2) return "#f97316";
    if (g > 1.5) return "#eab308";
    return "#10b981";
  };

  // Get RSSI signal quality color and text
  const getSignalQuality = (
    rssi: number
  ): { color: string; text: string; bars: number } => {
    if (rssi >= -50) return { color: "#10b981", text: "EXCELLENT", bars: 5 };
    if (rssi >= -60) return { color: "#22c55e", text: "GOOD", bars: 4 };
    if (rssi >= -70) return { color: "#eab308", text: "FAIR", bars: 3 };
    if (rssi >= -80) return { color: "#f97316", text: "POOR", bars: 2 };
    return { color: "#dc2626", text: "WEAK", bars: 1 };
  };

  const signalQuality = getSignalQuality(rssi);

  return (
    <div className="flex flex-col h-full border border-black bg-white overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-black">
            IMU MOTION DATA
          </span>
          <div className="flex items-center gap-2">
            {/* Signal Quality */}
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-sm ${
                      i < signalQuality.bars ? "opacity-100" : "opacity-30"
                    }`}
                    style={{
                      height: `${4 + i * 2}px`,
                      backgroundColor: signalQuality.color,
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[8px] font-bold"
                style={{ color: signalQuality.color }}
              >
                {rssi}dBm
              </span>
            </div>
            {/* G-Force */}
            <span
              className="text-[9px] font-bold"
              style={{ color: getAccelColor(totalAccel) }}
            >
              {totalAccel.toFixed(2)}g
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-1 flex flex-col gap-1 overflow-hidden min-h-0">
        {/* Compact G-Force Display */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded px-2 py-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-600 font-bold uppercase">
              G-Force
            </span>
            <div className="flex items-center gap-1">
              {/* Mini horizontal bars showing intensity */}
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-1 rounded-sm transition-all duration-200 ${
                    totalAccel >= level ? "opacity-100" : "opacity-20"
                  }`}
                  style={{
                    height: `${8 + level * 2}px`,
                    backgroundColor: getAccelColor(totalAccel),
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-[18px] font-mono font-bold leading-none"
              style={{ color: getAccelColor(totalAccel) }}
            >
              {totalAccel.toFixed(2)}
            </span>
            <span className="text-[8px] text-gray-600 font-semibold">g</span>
          </div>
        </div>

        {/* Accelerometer with bars */}
        <div className="flex flex-col flex-shrink-0">
          <span className="text-[8px] text-gray-600 font-bold mb-1.5 uppercase">
            Accelerometer (g)
          </span>
          <div className="flex flex-col gap-1.5">
            {/* X Axis */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-red-600 w-3">X</span>
              <div className="flex-1 h-3.5 bg-gray-200 rounded overflow-hidden relative border border-gray-300">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-200 shadow-sm"
                  style={{
                    width: `${Math.min(Math.abs(accelX) * 20, 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-red-600 w-11 text-right">
                {accelX.toFixed(2)}
              </span>
            </div>
            {/* Y Axis */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-green-600 w-3">Y</span>
              <div className="flex-1 h-3.5 bg-gray-200 rounded overflow-hidden relative border border-gray-300">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-200 shadow-sm"
                  style={{
                    width: `${Math.min(Math.abs(accelY) * 20, 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-green-600 w-11 text-right">
                {accelY.toFixed(2)}
              </span>
            </div>
            {/* Z Axis */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-blue-600 w-3">Z</span>
              <div className="flex-1 h-3.5 bg-gray-200 rounded overflow-hidden relative border border-gray-300">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200 shadow-sm"
                  style={{
                    width: `${Math.min(Math.abs(accelZ) * 20, 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-600 w-11 text-right">
                {accelZ.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Gyroscope */}
        <div className="flex flex-col flex-shrink-0">
          <span className="text-[8px] text-gray-600 font-bold mb-1.5 uppercase">
            Gyroscope (°/s)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-300 rounded p-1.5 text-center">
              <div className="text-[8px] text-gray-600 font-semibold">X</div>
              <div className="text-[12px] font-mono font-bold text-red-600 leading-tight">
                {gyroX.toFixed(1)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded p-1.5 text-center">
              <div className="text-[8px] text-gray-600 font-semibold">Y</div>
              <div className="text-[12px] font-mono font-bold text-green-600 leading-tight">
                {gyroY.toFixed(1)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded p-1.5 text-center">
              <div className="text-[8px] text-gray-600 font-semibold">Z</div>
              <div className="text-[12px] font-mono font-bold text-blue-600 leading-tight">
                {gyroZ.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionPanel;
