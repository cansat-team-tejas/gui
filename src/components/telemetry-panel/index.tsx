import { useMemo } from "react";
import { useTelemetryLatest } from "../../hooks/use-xbee";
import { getSafeTelemetryData } from "../../utils/telemetry-helpers";
import PrimaryTelemetry from "./primary-telemetry";
import SecondaryTelemetry from "./secondary-telemetry";

const TelemetryPanel = () => {
  const latestTelemetry = useTelemetryLatest();
  const data = useMemo(
    () => getSafeTelemetryData(latestTelemetry),
    [latestTelemetry]
  );

  return (
    <section aria-label="Telemetry Information">
      <div className="border border-b-black border-t-black text-[13px] font-bold px-2 py-1 bg-[#D9D9D9]">
        TELEMETRY INFORMATION
      </div>
      <div className="flex flex-col w-full">
        <PrimaryTelemetry data={data} />
        <SecondaryTelemetry data={data} />
      </div>
    </section>
  );
};

export default TelemetryPanel;
