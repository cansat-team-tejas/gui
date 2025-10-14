import React from "react";
import { useXBeeGoStore, xbeeGoSelectors } from "../../store/xbee-go";
import LabelValue from "../label-value";

interface RSSIDisplayProps {
  className?: string;
}

export const RSSIDisplay: React.FC<RSSIDisplayProps> = ({ className = "" }) => {
  const uplinkRSSI = useXBeeGoStore(xbeeGoSelectors.rssiUplink);
  const downlinkRSSI = useXBeeGoStore(xbeeGoSelectors.rssiDownlink);
  const lastUpdate = useXBeeGoStore(xbeeGoSelectors.rssiLastUpdate);

  const formatRSSI = (rssi: number | null) => {
    if (rssi === null) return "N/A";
    return `${rssi} dBm`;
  };

  const getRSSIStatus = (rssi: number | null) => {
    if (rssi === null) return "text-gray-500";
    if (rssi > -50) return "text-green-600"; // Excellent
    if (rssi > -70) return "text-yellow-600"; // Good
    if (rssi > -90) return "text-orange-600"; // Fair
    return "text-red-600"; // Poor
  };

  const getSignalBars = (rssi: number | null) => {
    if (rssi === null) return 0;
    if (rssi > -50) return 4; // Excellent
    if (rssi > -70) return 3; // Good
    if (rssi > -90) return 2; // Fair
    if (rssi > -110) return 1; // Poor
    return 0; // No signal
  };

  const SignalBars: React.FC<{ bars: number }> = ({ bars }) => (
    <div className="flex items-end gap-1 ml-2">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 border border-black ${
            bar <= bars ? "bg-green-500" : "bg-gray-300"
          } ${
            bar === 1 ? "h-1" : bar === 2 ? "h-2" : bar === 3 ? "h-3" : "h-4"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className={`border border-black bg-white ${className}`}>
      <div className="bg-[#D9D9D9] px-2 py-1 border-b border-black">
        <span className="text-[10px] font-bold text-black">
          SIGNAL STRENGTH
        </span>
      </div>
      <div className="p-2 space-y-2">
        <div className="grid grid-cols-1 gap-1">
          <LabelValue label="UPLINK RSSI">
            <div className="flex items-center">
              <span
                className={`text-[10px] font-bold ${getRSSIStatus(uplinkRSSI)}`}
              >
                {formatRSSI(uplinkRSSI)}
              </span>
              <SignalBars bars={getSignalBars(uplinkRSSI)} />
            </div>
          </LabelValue>
        </div>
        <div className="grid grid-cols-1 gap-1">
          <LabelValue label="DOWNLINK RSSI">
            <div className="flex items-center">
              <span
                className={`text-[10px] font-bold ${getRSSIStatus(
                  downlinkRSSI
                )}`}
              >
                {formatRSSI(downlinkRSSI)}
              </span>
              <SignalBars bars={getSignalBars(downlinkRSSI)} />
            </div>
          </LabelValue>
        </div>
        {lastUpdate && (
          <div className="text-[8px] text-gray-600 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};
