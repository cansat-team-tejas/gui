import FlagIcon from "../../assets/icons/flag-icon";
import RouteTab from "../route-tab";

const Header = () => {
  return (
    <header className="bg-[#D9D9D9] h-[45px] w-screen border-black border-b px-2 py-1 flex justify-between">
      <div className="flex items-center gap-3 h-full">
        <div className="flex items-center gap-1 h-full">
          <FlagIcon className="h-full" />
          <div className=" flex items-center border border-black text-[12px] font-bold bg-[#00AD57] text-white px-6 h-full">
            FLIGHT MODE
          </div>
          <div className=" flex items-center border border-black text-[12px] font-bold bg-[#FFAB00] text-white px-6 h-full">
            DISCONNECTED
          </div>
        </div>

        <div className="flex items-center gap-3 h-full">
          <p className="text-[14px] font-bold">UTC: 23:04:32</p>
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
