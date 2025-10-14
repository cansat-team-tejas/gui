/**
 * Backend Status Component
 * Shows current status of Go backend connectivity
 */
import { useState, useEffect } from "react";
import { useSettingsState } from "../hooks";

const BackendStatusComponent = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(
    null
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const settingsState = useSettingsState();

  const checkBackendStatus = async () => {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `http://localhost:${
          settingsState.xbeeBackendURL?.split(":").pop() || 8000
        }/api/xbee/status`,
        {
          method: "GET",
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      setIsBackendAvailable(response.ok);
      setLastChecked(new Date());
    } catch (error) {
      setIsBackendAvailable(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [settingsState.xbeeBackendURL]);

  const statusColor =
    isBackendAvailable === null
      ? "bg-gray-500"
      : isBackendAvailable
      ? "bg-green-500"
      : "bg-red-500";

  const statusText =
    isBackendAvailable === null
      ? "CHECKING..."
      : isBackendAvailable
      ? "ONLINE"
      : "OFFLINE";

  return (
    <div className="border border-black bg-white p-2">
      <div className="text-[10px] font-bold mb-2">BACKEND STATUS</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <span className="text-[10px] font-bold min-w-[60px]">STATUS:</span>
          <div
            className={`px-2 py-1 text-[10px] font-bold text-white ${statusColor} ml-2`}
          >
            {statusText}
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-[10px] font-bold min-w-[60px]">
            LAST CHECK:
          </span>
          <div className="text-[10px] font-bold ml-2">
            {lastChecked ? lastChecked.toLocaleTimeString() : "---"}
          </div>
        </div>
      </div>
      {isBackendAvailable === false && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400">
          <div className="text-[10px] text-yellow-800">
            <strong>Backend Unavailable:</strong> Make sure the Go backend is
            running on port{" "}
            {settingsState.xbeeBackendURL?.split(":").pop() || 8000}. Some
            features may not work properly.
          </div>
          <button
            className="mt-1 px-2 py-1 bg-yellow-600 text-white text-[10px] rounded hover:bg-yellow-700"
            onClick={checkBackendStatus}
          >
            RETRY
          </button>
        </div>
      )}
    </div>
  );
};

export default BackendStatusComponent;
