import { useMemo } from "react";
import LabelValue, { SmallFont } from "../label-value";
import type { ITelemetryType } from "../../types/telemetry";

interface Props {
  data: ITelemetryType;
}

const PrimaryTelemetry = ({ data }: Props) => {
  const rows = useMemo(
    () => [
      {
        label: "BAROMETRIC ALTITUDE",
        value: (
          <>
            {data.ALTITUDE.toFixed(1)}
            <SmallFont>m</SmallFont>
            <SmallFont className="ml-2 text-gray-500">BARO</SmallFont>
          </>
        ),
      },
      {
        label: "GPS ALTITUDE",
        value: (
          <>
            {(data.GPS_ALTITUDE || 0).toFixed(1)}
            <SmallFont>m</SmallFont>
            <SmallFont className="ml-2 text-gray-500">GPS</SmallFont>
          </>
        ),
      },
      {
        label: "TEMPERATURE",
        value: (
          <>
            {(data.TEMPERATURE || 0).toFixed(1)}
            <SmallFont>°C</SmallFont>
            <SmallFont className="ml-2 text-gray-500">ENV</SmallFont>
          </>
        ),
      },
      {
        label: "MCU TEMPERATURE",
        value: (
          <>
            <span
              className={
                (data.MCU_TEMP_C || 0) > 70
                  ? "text-red-600 font-bold"
                  : (data.MCU_TEMP_C || 0) > 50
                  ? "text-yellow-600"
                  : "text-green-600"
              }
            >
              {data.MCU_TEMP_C?.toFixed(1) || "0.0"}
            </span>
            <SmallFont>°C</SmallFont>
            <SmallFont className="ml-2 text-gray-500">MCU</SmallFont>
          </>
        ),
      },
      {
        label: "PRESSURE",
        value: (
          <>
            {data.PRESSURE}
            <SmallFont>Pa</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              {((1013.25 - data.PRESSURE / 100) * 8.5).toFixed(0)}m ALT
            </SmallFont>
          </>
        ),
      },
      {
        label: "HUMIDITY",
        value: (
          <>
            {data.HUMIDITY.toFixed(1)}
            <SmallFont>%</SmallFont>
          </>
        ),
      },
      {
        label: "VOLTAGE",
        value: (
          <>
            <span
              className={
                data.VOLTAGE < 11
                  ? "text-red-600 font-bold"
                  : data.VOLTAGE < 12
                  ? "text-yellow-600 font-bold"
                  : "text-green-600 font-bold"
              }
            >
              {data.VOLTAGE.toFixed(1)}
            </span>
            <SmallFont>V</SmallFont>
          </>
        ),
      },
      {
        label: "CURRENT",
        value: (
          <>
            {(data.CURRENT || 0).toFixed(1)}
            <SmallFont>A</SmallFont>
          </>
        ),
      },
      {
        label: "POWER",
        value: (
          <>
            <span
              className={
                (data.POWER || 0) > 15
                  ? "text-yellow-600 font-bold"
                  : "text-gray-700"
              }
            >
              {(data.POWER || 0).toFixed(1)}
            </span>
            <SmallFont>W</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              {data.VOLTAGE > 0 && data.POWER
                ? ((data.POWER / data.VOLTAGE) * 100).toFixed(0)
                : "0"}
              % EFF
            </SmallFont>
          </>
        ),
      },
      {
        label: "GPS POSITION",
        value: (
          <span className="font-mono text-[10px]">
            {(data.LATITUDE || 0).toFixed(5)}°,{" "}
            {(data.LONGITUDE || 0).toFixed(5)}°
          </span>
        ),
      },
      {
        label: "GPS SATELLITES",
        value: (
          <>
            <span
              className={
                (data.SATELLITES || 0) < 4
                  ? "text-red-600 font-bold"
                  : (data.SATELLITES || 0) < 6
                  ? "text-yellow-600 font-bold"
                  : "text-green-600 font-bold"
              }
            >
              {data.SATELLITES}
            </span>
            <SmallFont> satellites</SmallFont>
          </>
        ),
      },
      {
        label: "ATTITUDE",
        value: (
          <>
            R:{data.ROLL.toFixed(1)}
            <SmallFont>°</SmallFont> P:{data.PITCH.toFixed(1)}
            <SmallFont>°</SmallFont> Y:{data.YAW.toFixed(1)}
            <SmallFont>°</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              |{Math.sqrt(data.ROLL ** 2 + data.PITCH ** 2).toFixed(1)}°|
            </SmallFont>
          </>
        ),
      },
    ],
    [data]
  );

  return (
    <>
      {rows.map(({ label, value }) => (
        <LabelValue key={label} label={label}>
          {value}
        </LabelValue>
      ))}
    </>
  );
};

export default PrimaryTelemetry;
