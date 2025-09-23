/**
 * Connection Status Component
 * Displays current connection status and selected port information
 */
import React from "react";
import LabelValue from "../../../components/label-value";
import type { ConnectionStatus } from "../types";

interface ConnectionStatusProps {
  connectionStatus: ConnectionStatus;
  statusMessage?: string;
}

const ConnectionStatusComponent: React.FC<ConnectionStatusProps> = ({
  connectionStatus,
  statusMessage,
}) => {
  const { isConnected, selectedPort } = connectionStatus;

  return (
    <div className="border border-black bg-white p-2">
      <div className="text-[10px] font-bold mb-2">CONNECTION STATUS</div>
      <div className="grid grid-cols-2 gap-2">
        <LabelValue label="STATUS" labelClassName="text-[10px] font-bold">
          <div
            className={`px-2 py-1 text-[10px] font-bold text-white ${
              isConnected ? "bg-[#00AD57]" : "bg-red-500"
            }`}
          >
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </div>
        </LabelValue>
        <LabelValue
          label="SELECTED PORT"
          labelClassName="text-[10px] font-bold"
        >
          <div className="text-[10px] font-bold">{selectedPort || "NONE"}</div>
        </LabelValue>
      </div>
      {statusMessage && (
        <div className="mt-2 text-[10px] font-bold text-black">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatusComponent;
