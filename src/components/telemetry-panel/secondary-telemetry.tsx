import { useMemo } from "react";
import LabelValue, { SmallFont } from "../label-value";
import type { ITelemetryType } from "../../types/telemetry";

interface Props {
  data: ITelemetryType;
}

const SecondaryTelemetry = ({ data }: Props) => {
  const rows = useMemo(
    () => [
      {
        label: "ACCELERATION",
        value: (
          <>
            X:{data.ACCEL_X.toFixed(1)} Y:{data.ACCEL_Y.toFixed(1)} Z:
            {data.ACCEL_Z.toFixed(1)}
            <SmallFont>m/s²</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              |
              {Math.sqrt(
                data.ACCEL_X ** 2 + data.ACCEL_Y ** 2 + data.ACCEL_Z ** 2
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
            X:{data.GYRO_X.toFixed(1)} Y:{data.GYRO_Y.toFixed(1)} Z:
            {data.GYRO_Z.toFixed(1)}
            <SmallFont>°/s</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              |
              {Math.sqrt(
                data.GYRO_X ** 2 + data.GYRO_Y ** 2 + data.GYRO_Z ** 2
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
                Math.abs(data.GYRO_SPIN_RATE || 0) > 5
                  ? "text-red-600 font-bold"
                  : Math.abs(data.GYRO_SPIN_RATE || 0) > 2
                  ? "text-yellow-600"
                  : "text-gray-700"
              }
            >
              {(data.GYRO_SPIN_RATE || 0).toFixed(1)}
            </span>
            <SmallFont>/s</SmallFont>
            <SmallFont className="ml-2 text-gray-500">
              {Math.abs(data.GYRO_SPIN_RATE || 0) > 5
                ? "HIGH"
                : Math.abs(data.GYRO_SPIN_RATE || 0) > 2
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
            ({data.MAG_X.toFixed(1)}
            <SmallFont>μT</SmallFont>, {data.MAG_Y.toFixed(1)}
            <SmallFont>μT</SmallFont>, {data.MAG_Z.toFixed(1)}
            <SmallFont>μT</SmallFont>)
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

export default SecondaryTelemetry;
