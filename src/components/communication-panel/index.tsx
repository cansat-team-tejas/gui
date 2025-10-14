import { useMemo } from "react";
import LabelValue, { SmallFont } from "../label-value";
import {
  useTelemetryLatest,
  useTelemetryDataRate,
  useMissionPacketsReceived,
  useMissionPacketsSent,
  useLastCommandEcho,
  useTelemetryMissionDuration,
} from "../../hooks/use-xbee-go";
import {
  getSafeTelemetryData,
  getRSSIStatus,
  formatTelemetryValue,
} from "../../utils/telemetry-helpers";

const CommunicationPanel = () => {
  const latestTelemetry = useTelemetryLatest();
  const dataRate = useTelemetryDataRate();
  const packetsReceived = useMissionPacketsReceived();
  const packetsSent = useMissionPacketsSent();
  const lastCommandEcho = useLastCommandEcho();
  const missionDuration = useTelemetryMissionDuration();
  // RSSI monitoring is handled by Go backend connection health
  const rssiUplink = null;
  const rssiDownlink = null;
  const rssiLastUpdate = null;

  // Memoize expensive calculations
  const safeTelemetry = useMemo(
    () => getSafeTelemetryData(latestTelemetry),
    [latestTelemetry]
  );
  const rssiStatus = useMemo(
    () => getRSSIStatus(rssiDownlink || 0),
    [rssiDownlink]
  );

  const commStats = useMemo(
    () => ({
      missionTime:
        missionDuration > 0 ? missionDuration : safeTelemetry.MISSION_TIME_S,
      packetsReceived,
      packetsSent,
      packetRate: dataRate,
      rssi: safeTelemetry.RSSI_DBM,
      cmdEcho: lastCommandEcho?.COMMAND_ECHO || "NO_CMD",
    }),
    [
      missionDuration,
      safeTelemetry.MISSION_TIME_S,
      safeTelemetry.RSSI_DBM,
      packetsReceived,
      packetsSent,
      dataRate,
      lastCommandEcho,
    ]
  );

  const LABEL_VALUE = useMemo(
    () => [
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
        value: <>{commStats.packetsSent}</>,
      },
      {
        label: "COMMAND ECHO",
        value: <>{commStats.cmdEcho}</>,
      },
      {
        label: "RSSI DOWN / UP",
        value: (
          <div className="flex items-center gap-1">
            <div className={`text-white px-2 w-max ${rssiStatus.color}`}>
              {rssiDownlink !== null ? rssiDownlink : "N/A"}
              <SmallFont>dBm</SmallFont>
            </div>
            <div className="text-white px-2 w-max bg-green-600">
              {rssiUplink !== null ? rssiUplink : "N/A"}
              <SmallFont>dBm</SmallFont>
            </div>
          </div>
        ),
      },
    ],
    [commStats, rssiStatus.color, rssiDownlink, rssiUplink, rssiLastUpdate]
  );

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
