import { useEffect, useState } from "react";
import FlagIcon from "../../assets/icons/flag-icon";
import { useIsConnected } from "../../hooks/use-xbee";
import RouteTab from "../route-tab";

const Header = () => {
  const isConnected = useIsConnected();
  const [currentTime, setCurrentTime] = useState<string>("00:00:00");

  useEffect(() => {
    // Update the time immediately
    updateTime();

    // Set up an interval to update the time every second
    const intervalId = setInterval(updateTime, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    setCurrentTime(`${hours}:${minutes}:${seconds}`);
  };

  return (
    <header className="bg-[#D9D9D9] h-[45px] w-screen border-black border-b px-2 py-1 flex justify-between">
      <div className="flex items-center gap-3 h-full">
        <div className="flex items-center gap-1 h-full">
          <FlagIcon className="h-full" />
          <div className=" flex items-center border border-black text-[12px] font-bold bg-[#00AD57] text-white px-6 h-full">
            FLIGHT MODE
          </div>
          <div
            className={`flex items-center border border-black text-[12px] font-bold ${
              isConnected ? "bg-[#00AD57]" : "bg-[#FFAB00]"
            } text-white px-6 h-full`}
          >
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </div>
        </div>

        <div className="flex items-center gap-3 h-full">
          <p className="text-[14px] font-bold">UTC: {currentTime}</p>
          <p className="text-[14px] font-bold">ID: 046</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <RouteTab />
      </div>
    </header>
  );
};

export default Header;
