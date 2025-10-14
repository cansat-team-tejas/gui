import React, { useState } from "react";
import { useXBeeGoStore, xbeeGoSelectors } from "../../store/xbee-go";
import Button from "../button";

interface RSSIPollingControlProps {
  className?: string;
}

export const RSSIPollingControl: React.FC<RSSIPollingControlProps> = ({
  className = "",
}) => {
  const isConnected = useXBeeGoStore(xbeeGoSelectors.isConnected);
  const isPollingActive = useXBeeGoStore(
    (state) => state.communication.rssiPolling.isActive
  );
  const pollingInterval = useXBeeGoStore(
    (state) => state.communication.rssiPolling.interval
  );
  const lastPollTime = useXBeeGoStore(
    (state) => state.communication.rssiPolling.lastPollTime
  );

  const startRSSIPolling = useXBeeGoStore((state) => state.startRSSIPolling);
  const stopRSSIPolling = useXBeeGoStore((state) => state.stopRSSIPolling);

  const [intervalInput, setIntervalInput] = useState(5000); // Default 5 seconds

  const handleStartPolling = () => {
    if (isConnected && intervalInput > 0) {
      startRSSIPolling(intervalInput);
    }
  };

  const handleStopPolling = () => {
    stopRSSIPolling();
  };

  const formatLastPoll = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Status Display */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold text-gray-700">RSSI POLLING:</span>
        <span
          className={`font-bold ${
            isPollingActive ? "text-green-600" : "text-gray-500"
          }`}
        >
          {isPollingActive ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      {/* Polling Details */}
      {isPollingActive && (
        <div className="text-[9px] text-gray-600 space-y-1">
          <div>Interval: {pollingInterval}ms</div>
          <div>Last Poll: {formatLastPoll(lastPollTime)}</div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-2">
        {!isPollingActive ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-bold text-gray-600">
                Interval (ms):
              </label>
              <input
                type="number"
                value={intervalInput}
                onChange={(e) => setIntervalInput(Number(e.target.value))}
                min={1000}
                max={30000}
                step={1000}
                className="flex-1 px-2 py-1 text-[10px] border border-gray-300 rounded"
                disabled={!isConnected}
              />
            </div>
            <Button
              onClick={handleStartPolling}
              disabled={!isConnected || intervalInput < 1000}
              variant="success"
              className="w-full text-[10px] py-1"
            >
              Start RSSI Polling
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleStopPolling}
            className="w-full text-[10px] py-1 bg-red-500 hover:bg-red-600 text-white"
          >
            Stop RSSI Polling
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="text-[8px] text-gray-500 text-center">
        Polls XBee AT DB command for signal strength
      </div>
    </div>
  );
};

export default RSSIPollingControl;
