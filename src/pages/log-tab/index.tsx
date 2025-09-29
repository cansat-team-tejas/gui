import { useState } from "react";
import PacketStreamView from "../../components/packet-stream";
import DataStatusDisplay from "../../components/data-status-display";
import Button from "../../components/button";
import LabelValue from "../../components/label-value";

const LogTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCommands, setShowCommands] = useState(true);
  const [showLogs, setShowLogs] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleClear = () => {
    console.log("Clear all logs/commands");
  };

  return (
    <section className="bg-white flex flex-col gap-2 w-full h-full p-2 overflow-hidden">
      <div className="flex justify-between items-end">
        <div className="flex gap-2 items-end">
          <LabelValue
            label="SEARCH"
            containerClassName="grid grid-cols-1 gap-1"
            labelClassName="text-[10px] font-bold min-w-[140px] max-w-[140px]"
          >
            <div className="border border-black bg-white px-2 py-1 h-[25px] flex items-center min-w-[250px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="FILTER MESSAGES"
                className="font-bold text-[10px] text-black bg-transparent border-none outline-none flex-1 placeholder:text-gray-500"
              />
            </div>
          </LabelValue>

          <LabelValue
            label="FILTERS"
            containerClassName="grid grid-cols-1 gap-1"
            labelClassName="text-[10px] font-bold min-w-[140px] max-w-[140px]"
          >
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10px] font-bold">
                <input
                  type="checkbox"
                  checked={showCommands}
                  onChange={(e) => setShowCommands(e.target.checked)}
                  className="w-3 h-3"
                />
                <span className="text-black">CMD</span>
              </label>
              <label className="flex items-center gap-1 text-[10px] font-bold">
                <input
                  type="checkbox"
                  checked={showLogs}
                  onChange={(e) => setShowLogs(e.target.checked)}
                  className="w-3 h-3"
                />
                <span className="text-black">LOG</span>
              </label>
              <label className="flex items-center gap-1 text-[10px] font-bold">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-3 h-3"
                />
                <span className="text-black">SCROLL</span>
              </label>
            </div>
          </LabelValue>

          <div className="flex gap-1">
            <Button onClick={handleClear} variant="warning">
              CLEAR
            </Button>
          </div>
        </div>

        <DataStatusDisplay />
      </div>

      <PacketStreamView
        searchTerm={searchTerm}
        showCommands={showCommands}
        showLogs={showLogs}
        autoScroll={autoScroll}
      />
    </section>
  );
};

export default LogTab;
