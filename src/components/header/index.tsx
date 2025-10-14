import FlagIcon from "../../assets/icons/flag-icon";
import { FLIGHT_STATES } from "../../constants";
import { useIsConnected, useTelemetryLatest } from "../../hooks/use-xbee-go";
import RouteTab from "../route-tab";
import UTCTime from "./utc-time";

const Header = () => {
  const isConnected = useIsConnected();
  const latestTelemetry = useTelemetryLatest();

  return (
    <header className="bg-[#D9D9D9] h-[45px] w-screen border-black border-b px-2 py-1 flex justify-between">
      <div className="flex items-center gap-3 h-full">
        <div className="flex items-center gap-1 h-full">
          <FlagIcon className="h-full" />
          <div className=" flex items-center border border-black text-[12px] font-bold bg-[#00AD57] text-white px-6 h-full">
            {latestTelemetry?.FLIGHT_STATE
              ? FLIGHT_STATES?.[latestTelemetry.FLIGHT_STATE]
              : "FLIGHT MODE"}
          </div>
          <div
            className={`flex items-center border border-black text-[12px] font-bold ${
              isConnected ? "bg-[#00AD57]" : "bg-[#FFAB00]"
            } text-white px-6 h-full`}
          >
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </div>
        </div>

        <UTCTime />
      </div>

      <div className="flex items-center gap-1">
        <RouteTab />
      </div>
    </header>
  );
};

export default Header;
