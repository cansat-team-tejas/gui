import { Dispatch, SetStateAction } from "react";

export enum TOGGLE_MODE_TYPE {
  TABLE = "TABLE",
  PACKETS = "PACKETS",
}

interface IViewModeToggleType {
  mode: "TABLE" | "PACKETS";
  toggleMode: Dispatch<SetStateAction<TOGGLE_MODE_TYPE>>;
}

const ViewModeToggle = ({ mode, toggleMode }: IViewModeToggleType) => {
  return (
    <div className="flex border border-black bg-white">
      <button
        type="button"
        onClick={() => toggleMode(TOGGLE_MODE_TYPE.TABLE)}
        className={`px-3 py-1 text-[12px] font-bold h-[25px] flex items-center justify-center border-r border-black ${
          mode === "TABLE"
            ? "bg-[#00AD57] text-white"
            : "bg-white text-black hover:opacity-80"
        }`}
      >
        TABLE VIEW
      </button>
      <button
        type="button"
        onClick={() => toggleMode(TOGGLE_MODE_TYPE.PACKETS)}
        className={`px-3 py-1 text-[12px] font-bold h-[25px] flex items-center justify-center ${
          mode === "PACKETS"
            ? "bg-[#00AD57] text-white"
            : "bg-white text-black hover:opacity-80"
        }`}
      >
        PACKET STREAM
      </button>
    </div>
  );
};

export default ViewModeToggle;
