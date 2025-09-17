import LabelValue, { SmallFont } from "../label-value";

const TelemetryPanel = () => {
  const TELEMETRY_DATA = [
    {
      label: "BAROMETRIC ALTITUDE",
      value: (
        <>
          143<SmallFont>m</SmallFont>
        </>
      ),
    },
    {
      label: "GNSS ALTITUDE",
      value: (
        <>
          143<SmallFont>m</SmallFont>
        </>
      ),
    },
    {
      label: "TEMPERATURE",
      value: (
        <>
          22.4<SmallFont>°C</SmallFont>
        </>
      ),
    },
    {
      label: "PRESSURE",
      value: (
        <>
          101.2<SmallFont>hPa</SmallFont>
        </>
      ),
    },
    {
      label: "HUMIDITY",
      value: (
        <>
          40<SmallFont>%</SmallFont>
        </>
      ),
    },
    {
      label: "VOLTAGE",
      value: (
        <>
          7.7<SmallFont>v</SmallFont>
        </>
      ),
    },
    {
      label: "CURRENT",
      value: (
        <>
          30<SmallFont>A</SmallFont>
        </>
      ),
    },
    {
      label: "POWER",
      value: (
        <>
          15<SmallFont>w</SmallFont>
        </>
      ),
    },
    {
      label: "GPS(ALT, LAT, LON)",
      value: (
        <>
          (
          <span>
            15.4<SmallFont>m</SmallFont>,45.67°,23.45°
          </span>
          )
        </>
      ),
    },
    {
      label: "GPS SATELLITES",
      value: <>7</>,
    },
    {
      label: "ATTITUDE",
      value: (
        <>
          (15<SmallFont>°</SmallFont>, 12<SmallFont>°</SmallFont>, 7
          <SmallFont>°</SmallFont>)
        </>
      ),
    },
    {
      label: "ACCELERATION",
      value: (
        <>
          (15<SmallFont>m/s²</SmallFont>, 12<SmallFont>m/s²</SmallFont>, 7
          <SmallFont>m/s²</SmallFont>)
        </>
      ),
    },
    {
      label: "GYROSCOPE",
      value: (
        <>
          <SmallFont>(</SmallFont>15<SmallFont>°/s</SmallFont>, 12
          <SmallFont>°/s</SmallFont>, 7<SmallFont>°/s)</SmallFont>
        </>
      ),
    },
    {
      label: "MAGNETOMETER",
      value: (
        <>
          (15<SmallFont>μT</SmallFont>, 12<SmallFont>μT</SmallFont>, 7
          <SmallFont>μT</SmallFont>)
        </>
      ),
    },
    {
      label: "AIR QUALITY",
      value: (
        <>
          23<SmallFont>PPM</SmallFont>
        </>
      ),
    },
    {
      label: "ROTATION RATE",
      value: (
        <>
          23<SmallFont>/s</SmallFont>
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
