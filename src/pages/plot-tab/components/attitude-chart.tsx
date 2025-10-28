import ReactECharts from "echarts-for-react";
import { useTelemetryHistory } from "../../../hooks/use-xbee";

const AttitudeChart = () => {
  const telemetryHistory = useTelemetryHistory();

  // Extract attitude data (roll, pitch, yaw) from telemetry history
  const rollData = telemetryHistory.map((t) => t.ROLL ?? 0);
  const pitchData = telemetryHistory.map((t) => t.PITCH ?? 0);
  const yawData = telemetryHistory.map((t) => t.YAW ?? 0);
  const timestamps = telemetryHistory.map((t) => t.MISSION_TIME_S ?? 0);

  // Common axis configuration
  const getCommonXAxis = () => ({
    type: "category",
    data: timestamps,
    axisLabel: {
      fontSize: 8,
      rotate: 0,
      formatter: (value: any) => {
        const num = typeof value === "number" ? value : parseFloat(value);
        return isNaN(num) ? value : num.toFixed(0);
      },
    },
    axisLine: {
      lineStyle: { color: "#000" },
    },
  });

  const getCommonYAxis = (name: string) => ({
    type: "value",
    name: name,
    nameTextStyle: {
      fontSize: 9,
      fontWeight: "bold",
    },
    axisLabel: {
      fontSize: 8,
      formatter: (value: number) => value.toFixed(0),
    },
    axisLine: {
      lineStyle: { color: "#000" },
    },
    splitLine: {
      lineStyle: {
        color: "#ddd",
        type: "dashed",
      },
    },
  });

  const commonTooltip = {
    trigger: "axis",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderColor: "#000",
    borderWidth: 1,
    textStyle: {
      color: "#fff",
      fontSize: 9,
    },
    formatter: (params: any) => {
      const time = params[0].axisValue;
      const value = params[0].value;
      return `<b>Time: ${time}s</b><br/>${params[0].marker} ${
        params[0].seriesName
      }: ${value.toFixed(2)}°`;
    },
  };

  // Individual chart options
  const rollOption = {
    backgroundColor: "transparent",
    grid: { top: 25, left: 45, right: 10, bottom: 20, containLabel: false },
    tooltip: commonTooltip,
    xAxis: getCommonXAxis(),
    yAxis: getCommonYAxis("Roll (°)"),
    series: [
      {
        name: "Roll",
        type: "line",
        data: rollData,
        smooth: true,
        lineStyle: { width: 2, color: "#ef4444" },
        itemStyle: { color: "#ef4444" },
        symbol: "none",
        areaStyle: { color: "rgba(239, 68, 68, 0.1)" },
      },
    ],
  };

  const pitchOption = {
    backgroundColor: "transparent",
    grid: { top: 25, left: 45, right: 10, bottom: 20, containLabel: false },
    tooltip: commonTooltip,
    xAxis: getCommonXAxis(),
    yAxis: getCommonYAxis("Pitch (°)"),
    series: [
      {
        name: "Pitch",
        type: "line",
        data: pitchData,
        smooth: true,
        lineStyle: { width: 2, color: "#22c55e" },
        itemStyle: { color: "#22c55e" },
        symbol: "none",
        areaStyle: { color: "rgba(34, 197, 94, 0.1)" },
      },
    ],
  };

  const yawOption = {
    backgroundColor: "transparent",
    grid: { top: 25, left: 45, right: 10, bottom: 20, containLabel: false },
    tooltip: commonTooltip,
    xAxis: getCommonXAxis(),
    yAxis: getCommonYAxis("Yaw (°)"),
    series: [
      {
        name: "Yaw",
        type: "line",
        data: yawData,
        smooth: true,
        lineStyle: { width: 2, color: "#3b82f6" },
        itemStyle: { color: "#3b82f6" },
        symbol: "none",
        areaStyle: { color: "rgba(59, 130, 246, 0.1)" },
      },
    ],
  };

  return (
    <div className="w-full h-full bg-white flex flex-col gap-0.5 p-1">
      <div className="flex-1 min-h-0">
        <ReactECharts
          option={rollOption}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>
      <div className="flex-1 min-h-0">
        <ReactECharts
          option={pitchOption}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>
      <div className="flex-1 min-h-0">
        <ReactECharts
          option={yawOption}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>
    </div>
  );
};

export default AttitudeChart;
