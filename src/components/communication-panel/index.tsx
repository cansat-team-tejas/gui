import { useEffect, useState } from "react";
import LabelValue, { SmallFont } from "../label-value";
import { useXBeeStore, xbeeSelectors } from "../../store/xbee";
import {
  useTelemetryLatest,
  useTelemetryDataRate,
  useMissionPacketsReceived,
  useLastCommandEcho,
} from "../../hooks/use-xbee";
import {
  getSafeTelemetryData,
  getRSSIStatus,
  formatTelemetryValue,
} from "../../utils/telemetry-helpers";

const CommunicationPanel = () => {
  const latestTelemetry = useTelemetryLatest();
  const dataRate = useTelemetryDataRate();
  const packetsReceived = useMissionPacketsReceived();
  const lastCommandEcho = useLastCommandEcho();
  const rssiUplink = useXBeeStore(xbeeSelectors.rssiUplink);
  const rssiDownlink = useXBeeStore(xbeeSelectors.rssiDownlink);
  const [missionStartTime, setMissionStartTime] = useState<Date | null>(null);

  // Use safe telemetry data with utilities
  const safeTelemetry = getSafeTelemetryData(latestTelemetry);
  const rssiStatus = getRSSIStatus(safeTelemetry.RSSI_DBM);

  const commStats = {
    missionTime: safeTelemetry.MISSION_TIME_S, // Use actual mission time from telemetry
    packetsReceived,
    packetRate: dataRate,
    rssi: safeTelemetry.RSSI_DBM,
    cmdEcho: lastCommandEcho?.COMMAND_ECHO || "NO_CMD",
  };

  // Set mission start time when first packet arrives
  useEffect(() => {
    if (commStats.packetsReceived > 0 && !missionStartTime) {
      setMissionStartTime(new Date());
    }
  }, [commStats.packetsReceived, missionStartTime]);

  const LABEL_VALUE = [
    {
      label: "MISSION TIMER",
      value: (
        <>
          {formatTelemetryValue(commStats.missionTime, 1)}
          <SmallFont>seconds</SmallFont>
        </>
      ),
    },
    {
      label: "PACKET RATE",
      value: (
        <>
          {commStats.packetRate.toFixed(1)}
          <SmallFont>Hz</SmallFont>
        </>
      ),
    },
    {
      label: "PACKET RECEIVED",
      value: <>{commStats.packetsReceived}</>,
    },
    {
      label: "PACKET SENT",
      value: <>0</>,
    },
    {
      label: "COMMAND ECHO",
      value: <>{commStats.cmdEcho}</>,
    },
    {
      label: "RSSI DOWN / UP",
      value: (
        <div className="flex gap-1">
          <div className={`text-white px-2 w-max ${rssiStatus.color}`}>
            {rssiDownlink ? Math.abs(rssiDownlink) : Math.abs(commStats.rssi)}
            <SmallFont>dBm</SmallFont>
          </div>
          <div className="bg-[#D9D9D9] text-black px-2 w-max">
            {rssiUplink ? Math.abs(rssiUplink) : "N/A"}
            <SmallFont>dBm</SmallFont>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section about="Communication Information">
      <div className="border border-b-black text-[13px] font-bold px-2 py-1 bg-[#D9D9D9]">
        COMMUNICATION INFORMATION
      </div>
      <div className="flex flex-col w-full">
        {LABEL_VALUE.map(({ label, value }) => (
          <LabelValue key={label} label={label}>
            {value}
          </LabelValue>
        ))}
      </div>
    </section>
  );
};

export default CommunicationPanel;
