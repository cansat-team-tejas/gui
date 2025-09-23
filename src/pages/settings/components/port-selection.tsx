/**
 * Port Selection Component
 * Handles port scanning and selection
 */
import React from "react";

interface PortSelectionProps {
  availablePorts: any[];
  selectedPort: string | null;
  isConnected: boolean;
  isScanning: boolean;
  onScanPorts: () => void;
  onPortSelect: (port: string) => void;
}

const PortSelection: React.FC<PortSelectionProps> = ({
  availablePorts,
  selectedPort,
  isConnected,
  isScanning,
  onScanPorts,
  onPortSelect,
}) => {
  return (
    <div className="border border-black bg-white p-2">
      <div className="text-[10px] font-bold mb-2">PORT SELECTION</div>
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <select
            value={selectedPort || ""}
            onChange={(e) => onPortSelect(e.target.value)}
            disabled={isConnected}
            className="flex-1 border border-black bg-white px-2 py-1 text-[10px] font-bold h-[25px] min-w-[200px]"
          >
            <option value="">SELECT PORT...</option>
            {availablePorts.map((port: any) => (
              <option key={port.path} value={port.path}>
                {port.path} - {port.manufacturer || "UNKNOWN"}
              </option>
            ))}
          </select>
          <button
            onClick={onScanPorts}
            disabled={isScanning || isConnected}
            className={`px-4 py-1 text-[10px] font-bold h-[25px] text-white ${
              isScanning || isConnected
                ? "bg-[#D9D9D9] text-black cursor-not-allowed"
                : "bg-[#FFAB00] hover:bg-[#e09900]"
            }`}
          >
            {isScanning ? "SCANNING..." : "SCAN PORTS"}
          </button>
        </div>
        <div className="text-[10px] font-bold">
          FOUND {availablePorts.length} PORT(S)
        </div>
      </div>
    </div>
  );
};

export default PortSelection;
