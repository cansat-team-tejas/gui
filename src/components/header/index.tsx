import FlagIcon from "../../assets/icons/flag-icon";
import { FLIGHT_STATES } from "../../constants";
import { useIsConnected, useTelemetryLatest } from "../../hooks/use-xbee";
import RouteTab from "../route-tab";
import UTCTime from "./utc-time";
import { useSimulationStore } from "../../store/simulation";

const Header = () => {
  const isConnected = useIsConnected();
  const latestTelemetry = useTelemetryLatest();
  const simMode = useSimulationStore((s) => s.mode);
  const simRunning = useSimulationStore((s) => s.isRunning);

  return (
    <header className="bg-[#D9D9D9] h-[45px] w-screen border-black border-b px-2 py-1 flex justify-between">
      <div className="flex items-center gap-3 h-full">
        <div className="flex items-center gap-1 h-full">
          {/* Logo before Indian flag */}
          <img
            src="/images/logo-1.svg"
            alt="Team Tejas Logo"
            className="h-full w-auto mr-1 scale-[1.3]"
          />
          <FlagIcon className="h-full" />
          <div className=" flex items-center border border-black text-[12px] font-bold bg-[#00AD57] text-white px-6 h-full">
            {typeof latestTelemetry?.FLIGHT_STATE === "number"
              ? FLIGHT_STATES[
                  latestTelemetry.FLIGHT_STATE as keyof typeof FLIGHT_STATES
                ]
              : "FLIGHT MODE"}
          </div>
          <div
            className={`flex items-center border border-black text-[12px] font-bold ${
              isConnected ? "bg-[#00AD57]" : "bg-[#FFAB00]"
            } text-white px-6 h-full`}
          >
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </div>
          {simMode === "gui" && (
            <div
              className={`flex items-center border border-black text-[12px] font-bold px-6 h-full ${
                simRunning ? "bg-[#00AD57] text-white" : "bg-[#D9D9D9] text-black"
              }`}
            >
              SIM {simRunning ? "ON" : "OFF"}
            </div>
          )}
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
