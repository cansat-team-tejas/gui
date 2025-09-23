/**
 * Connection Controls Component
 * Handles connect/disconnect functionality
 */
import React from "react";

interface ConnectionControlsProps {
  isConnected: boolean;
  selectedPort: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectionControls: React.FC<ConnectionControlsProps> = ({
  isConnected,
  selectedPort,
  isConnecting,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="border border-black bg-white p-2">
      <div className="text-[10px] font-bold mb-2">CONNECTION CONTROLS</div>
      <div className="flex gap-2">
        {!isConnected ? (
          <button
            onClick={onConnect}
            disabled={!selectedPort || isConnecting}
            className={`px-4 py-1 text-[10px] font-bold h-[25px] text-white ${
              !selectedPort || isConnecting
                ? "bg-[#D9D9D9] text-black cursor-not-allowed"
                : "bg-[#00AD57] hover:bg-[#009c4f]"
            }`}
          >
            {isConnecting ? "CONNECTING..." : "CONNECT"}
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="px-4 py-1 text-[10px] font-bold h-[25px] text-white bg-red-500 hover:bg-red-600"
          >
            DISCONNECT
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionControls;
