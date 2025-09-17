import React, { useState, useCallback } from "react";
import { useXBee } from "../contexts/xbee-provider";

export const SimpleXBeeDashboard: React.FC = () => {
  const {
    isConnected,
    availablePorts,
    selectedPort,
    scanPorts,
    connect,
    disconnect,
    transmit,
    receivedData,
    setSelectedPort,
    clearReceivedData,
  } = useXBee();

  const [message, setMessage] = useState("");

  const handleConnect = useCallback(async () => {
    if (!selectedPort) return;
    const success = await connect(selectedPort);
    if (success) {
      console.log(`Connected to ${selectedPort}`);
    } else {
      console.log("Connection failed");
    }
  }, [selectedPort, connect]);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    const success = await transmit(message);
    if (success) {
      console.log(`Sent: ${message}`);
      setMessage("");
    } else {
      console.log("Send failed");
    }
  }, [message, transmit]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Simple XBee Communication</h1>

      {/* Connection Panel */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-3">Connection</h2>

        <div className="space-y-3">
          {/* Port Selection */}
          <div className="flex gap-2">
            <select
              value={selectedPort || ""}
              onChange={(e) => setSelectedPort(e.target.value)}
              className="flex-1 p-2 border rounded"
              disabled={isConnected}
            >
              <option value="">Select a port...</option>
              {availablePorts.map((port) => (
                <option key={port.path} value={port.path}>
                  {port.path} - {port.manufacturer || "Unknown"}
                </option>
              ))}
            </select>
            <button
              onClick={scanPorts}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Scan
            </button>
          </div>

          {/* Connection Status and Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="font-medium">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={!selectedPort}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                Connect
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transmit Panel */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-3">Transmit</h2>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter message to send..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={!isConnected}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>

      {/* Receive Panel */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Received Data</h2>
          <button
            onClick={clearReceivedData}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear
          </button>
        </div>

        <div className="bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
          {receivedData.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No data received yet
            </div>
          ) : (
            <div className="space-y-1">
              {receivedData.map((data, index) => (
                <div
                  key={index}
                  className="font-mono text-sm p-2 bg-white rounded border"
                >
                  {data}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleXBeeDashboard;
