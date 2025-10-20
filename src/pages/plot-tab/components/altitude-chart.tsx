import { useTelemetryHistory } from "../../../hooks/use-xbee";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AltitudeChart = () => {
  const history = useTelemetryHistory();

  // Prepare chart data - use last 100 data points for performance
  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      // Generate synthetic data for demonstration
      return Array.from({ length: 50 }, (_, i) => {
        const time = i * 2; // 2 second intervals
        const baseAltitude = Math.sin(i / 10) * 500 + 1000 + i * 15; // Ascending with oscillation
        const noise = Math.random() * 20 - 10; // Random noise

        return {
          index: i,
          time: time.toFixed(1),
          barometric: baseAltitude + noise,
          gps: baseAltitude + noise * 2 + (Math.random() - 0.5) * 30, // GPS with more variance
          pressure: 1013 - baseAltitude / 10, // Pressure decreases with altitude
          temperature: 25 - baseAltitude / 100 + Math.sin(i / 5) * 3, // Temp decreases, with variation
        };
      });
    }

    // Get last 100 points or all if less
    const dataPoints = history.slice(-100);

    return dataPoints.map((point, index) => ({
      index,
      time: point.MISSION_TIME_S?.toFixed(1) || "0",
      barometric: point.ALTITUDE || 0,
      gps: point.GPS_ALTITUDE || 0,
      pressure: point.PRESSURE / 10 || 0, // Scale down pressure for visibility
      temperature: point.TEMPERATURE || 0,
    }));
  }, [history]);

  // Calculate current values for header display
  const currentData = useMemo(() => {
    const latest = chartData[chartData.length - 1];
    if (!latest) return { baro: 0, gps: 0, temp: 0 };
    return {
      baro: latest.barometric,
      gps: latest.gps,
      temp: latest.temperature,
    };
  }, [chartData]);

  return (
    <div className="flex flex-col h-full border border-black bg-white">
      {/* Header with Legend and Current Values */}
      <div className="px-2 py-1 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Title and Legend */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-black">
              ALTITUDE TELEMETRY
            </span>
            <div className="flex items-center gap-2">
              {/* Barometric Legend */}
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-[#2563eb]"></div>
                <span className="text-[9px] text-gray-700">BARO</span>
              </div>
              {/* GPS Legend */}
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-[#f97316] border-dashed border-t"></div>
                <span className="text-[9px] text-gray-700">GPS</span>
              </div>
              {/* Temperature Legend */}
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-[#dc2626] border-dashed border-t"></div>
                <span className="text-[9px] text-gray-700">TEMP</span>
              </div>
            </div>
          </div>

          {/* Current Values */}
          <div className="flex items-center gap-3 text-[9px] font-semibold">
            <span className="text-[#2563eb]">
              {currentData.baro.toFixed(1)}m
            </span>
            <span className="text-[#f97316]">
              {currentData.gps.toFixed(1)}m
            </span>
            <span className="text-[#dc2626]">
              {currentData.temp.toFixed(1)}°C
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ left: 4, right: 4, top: 5, bottom: 0 }}
        >
          {/* Barometric Altitude Line */}

          {/* Barometric Altitude Line - bold, smooth, shadow */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="barometric"
            stroke="#2563eb"
            strokeWidth={2.8}
            dot={false}
            isAnimationActive={false}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 2px #2563eb88)" }}
          />
          {/* GPS Altitude Line - orange, dashed, shadow */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gps"
            stroke="#f97316"
            strokeWidth={2.2}
            dot={false}
            isAnimationActive={false}
            strokeDasharray="6 3"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 2px #f9731688)" }}
          />
          {/* Temperature Line - red, thin, dashed, shadow */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="temperature"
            stroke="#dc2626"
            strokeWidth={1.3}
            strokeDasharray="3 3"
            dot={false}
            isAnimationActive={false}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 1px #dc262688)" }}
          />

          {/* Lighter, less distracting grid */}
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />

          {/* Reference Lines for Max Values - subtle, compact label */}

          {/* X-Axis */}

          <XAxis
            height={30}
            dataKey="time"
            label={{
              value: "MISSION TIME (S)",
              position: "insideBottom",
              style: {
                fontSize: "11px",
                fontWeight: 700,
                fill: "black",
                textTransform: "uppercase",
              },
              dy: 0,
            }}
            interval="preserveStartEnd"
            minTickGap={20}
            tick={{ fontSize: "9px", fontWeight: 600 }}
          />

          {/* Left Y-Axis (Altitude) */}
          <YAxis
            yAxisId="left"
            width={48}
            label={{
              value: "ALTITUDE (M)",
              angle: -90,
              position: "insideLeft",
              style: {
                fontSize: "10px",
                fontWeight: 700,
                fill: "black",
                textTransform: "uppercase",
              },
              offset: 6,
            }}
            tick={{ fontSize: "9px", fontWeight: 600 }}
            tickMargin={2}
          />

          {/* Right Y-Axis (Temperature) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            width={48}
            label={{
              value: "TEMP (°C)",
              angle: 90,
              position: "insideRight",
              style: {
                fontSize: "10px",
                fontWeight: 700,
                fill: "black",
                textTransform: "uppercase",
              },
              offset: 6,
            }}
            tick={{ fontSize: "9px", fontWeight: 600 }}
            tickMargin={2}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #2563eb33",
              borderRadius: "6px",
              padding: "7px 10px",
              boxShadow: "0 2px 8px #0001",
            }}
            formatter={(value: any, name: string) => {
              if (name === "barometric")
                return [`${Number(value).toFixed(1)} m`, "Barometric Altitude"];
              if (name === "gps")
                return [`${Number(value).toFixed(1)} m`, "GPS Altitude"];
              if (name === "temperature")
                return [`${Number(value).toFixed(1)} °C`, "Temperature"];
              return [value, name];
            }}
            labelFormatter={(label) => `Time: ${label} s`}
            labelStyle={{ fontSize: "11px", fontWeight: 700, color: "#111618" }}
            itemStyle={{ fontSize: "10px" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AltitudeChart;
