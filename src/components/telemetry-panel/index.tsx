import { useMemo } from "react";
import LabelValue, { SmallFont } from "../label-value";
import { useTelemetryLatest } from "../../hooks/use-xbee";
import { getSafeTelemetryData } from "../../utils/telemetry-helpers";

const TelemetryPanel = () => {
  const latestTelemetry = useTelemetryLatest();

  // Use safe telemetry data with proper fallbacks
  const telemetryData = useMemo(
    () => getSafeTelemetryData(latestTelemetry),
    [latestTelemetry]
  );

  // Primary telemetry data - core flight parameters
  const PRIMARY_DATA = useMemo(
    () => [
      {
        label: "BAROMETRIC ALTITUDE",
        value: (
          <>
            {telemetryData.ALTITUDE.toFixed(1)}
            <SmallFont>m</SmallFont>
            <SmallFont className="ml-2 text-gray-500">BARO</SmallFont>
          </>
        ),
      },
      {
        label: "GPS ALTITUDE",
        value: (
          <>
            {(telemetryData.GPS_ALTITUDE || 0).toFixed(1)}
            <SmallFont>m</SmallFont>
            <SmallFont className="ml-2 text-gray-500">GPS</SmallFont>
          </>
        ),
      },
      {
        label: "TEMPERATURE",
        value: (
          <>
            {(telemetryData.TEMPERATURE || 0).toFixed(1)}
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
                (telemetryData.MCU_TEMP_C || 0) > 70
                  ? "text-red-600 font-bold"
                  : (telemetryData.MCU_TEMP_C || 0) > 50
                  ? "text-yellow-600"
                  : "text-green-600"
              }
            >
              {telemetryData.MCU_TEMP_C?.toFixed(1) || "0.0"}
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
            {telemetryData.PRESSURE}
            <SmallFont>Pa</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              {((1013.25 - telemetryData.PRESSURE / 100) * 8.5).toFixed(0)}m ALT
            </SmallFont>
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
            <span
              className={
                telemetryData.VOLTAGE < 11
                  ? "text-red-600 font-bold"
                  : telemetryData.VOLTAGE < 12
                  ? "text-yellow-600 font-bold"
                  : "text-green-600 font-bold"
              }
            >
              {telemetryData.VOLTAGE.toFixed(1)}
            </span>
            <SmallFont>V</SmallFont>
          </>
        ),
      },
      {
        label: "CURRENT",
        value: (
          <>
            {(telemetryData.CURRENT || 0).toFixed(1)}
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
                (telemetryData.POWER || 0) > 15
                  ? "text-yellow-600 font-bold"
                  : "text-gray-700"
              }
            >
              {(telemetryData.POWER || 0).toFixed(1)}
            </span>
            <SmallFont>W</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              {telemetryData.VOLTAGE > 0 && telemetryData.POWER
                ? ((telemetryData.POWER / telemetryData.VOLTAGE) * 100).toFixed(
                    0
                  )
                : "0"}
              % EFF
            </SmallFont>
          </>
        ),
      },
      {
        label: "GPS POSITION",
        value: (
          <>
            <span className="font-mono text-[10px]">
              {(telemetryData.LATITUDE || 0).toFixed(5)}
              °, {(telemetryData.LONGITUDE || 0).toFixed(5)}°
            </span>
          </>
        ),
      },
      {
        label: "GPS SATELLITES",
        value: (
          <>
            <span
              className={
                (telemetryData.SATELLITES || 0) < 4
                  ? "text-red-600 font-bold"
                  : (telemetryData.SATELLITES || 0) < 6
                  ? "text-yellow-600 font-bold"
                  : "text-green-600 font-bold"
              }
            >
              {telemetryData.SATELLITES}
            </span>
            <SmallFont> satellites</SmallFont>
          </>
        ),
      },
      {
        label: "ATTITUDE",
        value: (
          <>
            R:{telemetryData.ROLL.toFixed(1)}
            <SmallFont>°</SmallFont> P:{telemetryData.PITCH.toFixed(1)}
            <SmallFont>°</SmallFont> Y:{telemetryData.YAW.toFixed(1)}
            <SmallFont>°</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              |
              {Math.sqrt(
                telemetryData.ROLL ** 2 + telemetryData.PITCH ** 2
              ).toFixed(1)}
              °|
            </SmallFont>
          </>
        ),
      },
    ],
    [telemetryData]
  );

  // Secondary data - detailed sensors
  const SECONDARY_DATA = useMemo(
    () => [
      {
        label: "ACCELERATION",
        value: (
          <>
            X:{telemetryData.ACCEL_X.toFixed(1)} Y:
            {telemetryData.ACCEL_Y.toFixed(1)} Z:
            {telemetryData.ACCEL_Z.toFixed(1)}
            <SmallFont>m/s²</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              |
              {Math.sqrt(
                telemetryData.ACCEL_X ** 2 +
                  telemetryData.ACCEL_Y ** 2 +
                  telemetryData.ACCEL_Z ** 2
              ).toFixed(1)}
              |
            </SmallFont>
          </>
        ),
      },
      {
        label: "GYROSCOPE",
        value: (
          <>
            X:{telemetryData.GYRO_X.toFixed(1)} Y:
            {telemetryData.GYRO_Y.toFixed(1)} Z:
            {telemetryData.GYRO_Z.toFixed(1)}
            <SmallFont>°/s</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              |
              {Math.sqrt(
                telemetryData.GYRO_X ** 2 +
                  telemetryData.GYRO_Y ** 2 +
                  telemetryData.GYRO_Z ** 2
              ).toFixed(1)}
              |
            </SmallFont>
          </>
        ),
      },
      {
        label: "ROTATION RATE",
        value: (
          <>
            <span
              className={
                Math.abs(telemetryData.GYRO_SPIN_RATE || 0) > 5
                  ? "text-red-600 font-bold"
                  : Math.abs(telemetryData.GYRO_SPIN_RATE || 0) > 2
                  ? "text-yellow-600"
                  : "text-gray-700"
              }
            >
              {(telemetryData.GYRO_SPIN_RATE || 0).toFixed(1)}
            </span>
            <SmallFont>/s</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              {Math.abs(telemetryData.GYRO_SPIN_RATE || 0) > 5
                ? "HIGH"
                : Math.abs(telemetryData.GYRO_SPIN_RATE || 0) > 2
                ? "MED"
                : "LOW"}
            </SmallFont>
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
    ],
    [telemetryData]
  );

  return (
    <section about="Telemetry Information">
      <div className="border border-b-black border-t-black text-[13px] font-bold px-2 py-1 bg-[#D9D9D9]">
        TELEMETRY INFORMATION
      </div>
      <div className="flex flex-col w-full">
        {PRIMARY_DATA.map(({ label, value }) => (
          <LabelValue key={label} label={label}>
            {value}
          </LabelValue>
        ))}

        {SECONDARY_DATA.map(({ label, value }) => (
          <LabelValue key={label} label={label}>
            {value}
          </LabelValue>
        ))}
      </div>
    </section>
  );
};

export default TelemetryPanel;
