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
  AreaChart,
  Area,
} from "recharts";

const AltitudeChart = () => {
  const history = useTelemetryHistory();

  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      return Array.from({ length: 50 }, (_, i) => {
        const time = i * 2;
        const base = Math.sin(i / 10) * 500 + 1000 + i * 15;
        const noise = Math.random() * 20 - 10;
        return {
          time: time.toFixed(1),
          barometric: base + noise,
          gps: base + noise * 2 + (Math.random() - 0.5) * 30,
          temperature: 25 - base / 100 + Math.sin(i / 5) * 3,
        };
      });
    }

    const dataPoints = history.slice(-100);
    return dataPoints.map((p) => ({
      time: p.MISSION_TIME_S?.toFixed(1) || "0",
      barometric: p.ALTITUDE || 0,
      gps: p.GPS_ALTITUDE || 0,
      temperature: p.TEMPERATURE || 0,
    }));
  }, [history]);

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
      {/* Header */}
      <div className="px-2 py-1 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-black">
              ALTITUDE TELEMETRY
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-[#2563eb]"></div>
                <span className="text-[9px] text-gray-700">BARO</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-[#f97316] border-dashed border-t"></div>
                <span className="text-[9px] text-gray-700">GPS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[9px] font-semibold">
            <span className="text-[#2563eb]">
              {currentData.baro.toFixed(1)}m
            </span>
            <span className="text-[#f97316]">
              {currentData.gps.toFixed(1)}m
            </span>
          </div>
        </div>
      </div>

      {/* Altitude Chart */}
      <div className="flex-1 h-[60%]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 4, right: 4, top: 5 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />
            <XAxis
              dataKey="time"
              label={{
                value: "MISSION TIME (S)",
                position: "insideBottom",
                style: { fontSize: "10px", fontWeight: 700, fill: "black" },
              }}
              tick={{ fontSize: "9px", fontWeight: 600 }}
            />
            <YAxis
              label={{
                value: "ALTITUDE (M)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: "10px", fontWeight: 700, fill: "black" },
              }}
              tick={{ fontSize: "9px", fontWeight: 600 }}
            />
            <Tooltip
              formatter={(v: any, n?: string) => [
                `${Number(v).toFixed(1)} m`,
                n === "barometric" ? "Barometric" : "GPS",
              ]}
              labelFormatter={(l) => `Time: ${l} s`}
            />
            <Line
              type="monotone"
              dataKey="barometric"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="gps"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              strokeDasharray="6 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Temperature Chart */}
      <div className="flex-1 h-[40%] border-t border-black">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 4, right: 4, top: 5 }}>
            <defs>
              <linearGradient id="tempColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: "9px", fontWeight: 600 }}
              label={{
                value: "MISSION TIME (S)",
                position: "insideBottom",
                style: { fontSize: "10px", fontWeight: 700, fill: "black" },
              }}
            />
            <YAxis
              label={{
                value: "TEMP (°C)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: "10px", fontWeight: 700, fill: "black" },
              }}
              tick={{ fontSize: "9px", fontWeight: 600 }}
            />
            <Tooltip
              formatter={(v: any) => [
                `${Number(v).toFixed(1)} °C`,
                "Temperature",
              ]}
              labelFormatter={(l) => `Time: ${l} s`}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#dc2626"
              fill="url(#tempColor)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AltitudeChart;
