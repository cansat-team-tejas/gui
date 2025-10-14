/**
 * Go Backend Configuration Component
 * Allows users to configure the XBee Go backend service URL
 */
import React from "react";
import { useSettingsState } from "../hooks";
import { xbeeGoAPI } from "../../../utils/xbee-go-api";
import { BACKEND_CONFIG } from "../../../constants";

const GoBackendConfig: React.FC = () => {
  const settingsState = useSettingsState();

  const handleURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newURL = event.target.value;
    settingsState.setXbeeBackendURL(newURL);
  };

  const testConnection = async () => {
    try {
      const status = await xbeeGoAPI.getStatus();
      const connectionMessage = status.connected
        ? status.port
          ? `Backend reachable. XBee currently connected on ${status.port}.`
          : "Backend reachable. XBee is connected, port information unavailable."
        : "Backend reachable, but XBee is not connected.";
      alert(connectionMessage);
    } catch (error) {
      alert(
        `Connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800">
        Go Backend Configuration
      </h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Backend Service URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={settingsState.xbeeBackendURL}
            onChange={handleURLChange}
            placeholder={BACKEND_CONFIG.BACKEND_URL}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Test
          </button>
        </div>
        <p className="text-sm text-gray-600">
          URL of the Go backend service that handles XBee communication and data
          management.
        </p>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          <strong>Features provided by Go backend:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>XBee serial port management and communication</li>
          <li>Real-time telemetry streaming via WebSocket</li>
          <li>Automatic mission management and database creation</li>
          <li>Connection health monitoring</li>
          <li>Telemetry data storage and retrieval</li>
        </ul>
      </div>
    </div>
  );
};

export default GoBackendConfig;
