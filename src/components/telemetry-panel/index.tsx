import { useMemo } from "react";
import LabelValue, { SmallFont } from "../label-value";
import { useTelemetryLatest } from "../../hooks/use-xbee";
import {
  getSafeTelemetryData,
  formatTelemetryValue,
} from "../../utils/telemetry-helpers";

const TelemetryPanel = () => {
  const latestTelemetry = useTelemetryLatest();

  // Use safe telemetry data with proper fallbacks
  const telemetryData = getSafeTelemetryData(latestTelemetry);

  const TELEMETRY_DATA = [
    {
      label: "BAROMETRIC ALTITUDE",
      value: (
        <>
          {telemetryData.ALTITUDE.toFixed(1)}
          <SmallFont>m</SmallFont>
        </>
      ),
    },
    {
      label: "GNSS ALTITUDE",
      value: (
        <>
          {telemetryData.GPS_ALTITUDE.toFixed(1)}
          <SmallFont>m</SmallFont>
        </>
      ),
    },
    {
      label: "TEMPERATURE",
      value: (
        <>
          {telemetryData.TEMP.toFixed(1)}
          <SmallFont>°c</SmallFont>
        </>
      ),
    },
    {
      label: "PRESSURE",
      value: (
        <>
          {telemetryData.PRESSURE}
          <SmallFont>Pa</SmallFont>
        </>
      ),
    },
    {
      label: "HUMIDITY",
      value: (
        <>
          {telemetryData.HUMIDITY.toFixed(1)}
          <SmallFont>%</SmallFont>
        </>
      ),
    },
    {
      label: "VOLTAGE",
      value: (
        <>
          {telemetryData.VOLTAGE.toFixed(1)}
          <SmallFont>v</SmallFont>
        </>
      ),
    },
    {
      label: "CURRENT",
      value: (
        <>
          {telemetryData.CURRENT.toFixed(1)}
          <SmallFont>A</SmallFont>
        </>
      ),
    },
    {
      label: "POWER",
      value: (
        <>
          {telemetryData.POWER.toFixed(1)}
          <SmallFont>w</SmallFont>
        </>
      ),
    },
    {
      label: "GPS(ALT, LAT, LON)",
      value: (
        <>
          (
          <span>
            {telemetryData.GPS_ALTITUDE.toFixed(1)}
            <SmallFont>m</SmallFont>,{telemetryData.LATITUDE.toFixed(3)}°,
            {telemetryData.LONGITUDE.toFixed(3)}°
          </span>
          )
        </>
      ),
    },
    {
      label: "GPS SATELLITES",
      value: <>{telemetryData.SATELLITES}</>,
    },
    {
      label: "ATTITUDE",
      value: (
        <>
          ({telemetryData.ROLL.toFixed(1)}
          <SmallFont>°</SmallFont>, {telemetryData.PITCH.toFixed(1)}
          <SmallFont>°</SmallFont>, {telemetryData.YAW.toFixed(1)}
          <SmallFont>°</SmallFont>)
        </>
      ),
    },
    {
      label: "ACCELERATION",
      value: (
        <>
          ({telemetryData.ACCEL_X.toFixed(1)}
          <SmallFont>m/s²</SmallFont>, {telemetryData.ACCEL_Y.toFixed(1)}
          <SmallFont>m/s²</SmallFont>, {telemetryData.ACCEL_Z.toFixed(1)}
          <SmallFont>m/s²</SmallFont>)
        </>
      ),
    },
    {
      label: "GYROSCOPE",
      value: (
        <>
          <SmallFont>(</SmallFont>
          {telemetryData.GYRO_X.toFixed(1)}
          <SmallFont>°/s</SmallFont>, {telemetryData.GYRO_Y.toFixed(1)}
          <SmallFont>°/s</SmallFont>, {telemetryData.GYRO_Z.toFixed(1)}
          <SmallFont>°/s)</SmallFont>
        </>
      ),
    },
    {
      label: "MAGNETOMETER",
      value: (
        <>
          ({telemetryData.MAG_X.toFixed(1)}
          <SmallFont>μT</SmallFont>, {telemetryData.MAG_Y.toFixed(1)}
          <SmallFont>μT</SmallFont>, {telemetryData.MAG_Z.toFixed(1)}
          <SmallFont>μT</SmallFont>)
        </>
      ),
    },
    {
      label: "AIR QUALITY",
      value: (
        <>
          {telemetryData.AIR_QUALITY_PPM.toFixed(1)}
          <SmallFont>PPM</SmallFont>
        </>
      ),
    },
    {
      label: "ROTATION RATE",
      value: (
        <>
          {telemetryData.GYRO_SPIN.toFixed(1)}
          <SmallFont>/s</SmallFont>
        </>
      ),
    },
    {
      label: "CAMERA [A, B]",
      value: <>[OK, OK]</>,
    },
  ];

  return (
    <section about="Telemetry Information">
      <div className="border border-b-black border-t-black text-[13px] font-bold px-2 py-1 bg-[#D9D9D9]">
        TELEMETRY INFORMATION
      </div>
      <div className="flex flex-col w-full">
        {TELEMETRY_DATA.map(({ label, value }) => (
          <LabelValue key={label} label={label}>
            {value}
          </LabelValue>
        ))}
      </div>
    </section>
  );
};

export default TelemetryPanel;
