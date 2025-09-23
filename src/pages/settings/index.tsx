/**
 * Settings Page - Main Component
 * Modular settings page with RHF and Zod validation
 */
import React from "react";
import { AutoConnectButton } from "../../components/auto-connect-button";
import { GuiResetButton } from "../../components/gui-reset-button";
import {
  useIsConnected,
  useAvailablePorts,
  useSelectedPort,
  useSetSelectedPort,
} from "../../hooks/use-xbee";

// Settings components
import {
  ConnectionStatusComponent,
  PortSelection,
  ConnectionControls,
  CustomCommandControl,
  CommandCategory,
  QnhControl,
} from "./components";

// Settings hooks and constants
import {
  useSettingsState,
  usePortScanning,
  useConnectionManagement,
  useCommandManagement,
} from "./hooks";
import {
  SYSTEM_CONTROL_COMMANDS,
  EMERGENCY_COMMANDS,
  CALIBRATION_COMMANDS,
  FLIGHT_CONTROL_COMMANDS,
  SD_CARD_COMMANDS,
} from "./constants";

const SettingsPage: React.FC = () => {
  // XBee store hooks
  const isConnected = useIsConnected();
  const availablePorts = useAvailablePorts();
  const selectedPort = useSelectedPort();
  const setSelectedPort = useSetSelectedPort();

  // Settings state management
  const settingsState = useSettingsState();

  // Custom hooks for functionality
  const { handleScanPorts } = usePortScanning(settingsState);
  const { handleConnect, handleDisconnect } = useConnectionManagement(
    settingsState,
    selectedPort
  );
  const { handleSendCommand, handleQnhSet } =
    useCommandManagement(settingsState);

  // Connection status object
  const connectionStatus = {
    isConnected,
    selectedPort,
    status: settingsState.connectionStatus,
  };

  return (
    <div className="bg-white flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-black bg-[#D9D9D9] px-3 py-2">
        <div className="text-[12px] font-bold">SYSTEM CONFIGURATION</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">
          {/* Connection Status Section */}
          <div className="border border-black bg-white">
            <div className="bg-[#D9D9D9] px-2 py-1 border-b border-black">
              <div className="text-[10px] font-bold">CONNECTION STATUS</div>
            </div>
            <div className="p-2">
              <ConnectionStatusComponent
                connectionStatus={connectionStatus}
                statusMessage={settingsState.connectionStatus}
              />
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="border border-black bg-white">
            <div className="bg-[#D9D9D9] px-2 py-1 border-b border-black">
              <div className="text-[10px] font-bold">QUICK ACTIONS</div>
            </div>
            <div className="p-2 space-y-2">
              <div>
                <div className="text-[9px] font-bold text-gray-600 mb-1">
                  AUTO-DETECT XBEE
                </div>
                <AutoConnectButton />
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-600 mb-1">
                  RESET APPLICATION
                </div>
                <GuiResetButton />
              </div>
            </div>
          </div>

          {/* Port Configuration Section */}
          <div className="border border-black bg-white">
            <div className="bg-[#D9D9D9] px-2 py-1 border-b border-black">
              <div className="text-[10px] font-bold">PORT CONFIGURATION</div>
            </div>
            <div className="p-2">
              <PortSelection
                availablePorts={availablePorts}
                selectedPort={selectedPort}
                isConnected={isConnected}
                isScanning={settingsState.isScanning}
                onScanPorts={handleScanPorts}
                onPortSelect={setSelectedPort}
              />
            </div>
          </div>

          {/* Manual Connection Section */}
          <div className="border border-black bg-white">
            <div className="bg-[#D9D9D9] px-2 py-1 border-b border-black">
              <div className="text-[10px] font-bold">MANUAL CONNECTION</div>
            </div>
            <div className="p-2">
              <ConnectionControls
                isConnected={isConnected}
                selectedPort={selectedPort}
                isConnecting={settingsState.isConnecting}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            </div>
          </div>

          {/* Command Control Section */}
          {isConnected && (
            <div className="border border-black bg-white">
              <div className="bg-[#D9D9D9] px-2 py-1 border-b border-black">
                <div className="text-[10px] font-bold">COMMAND CONTROL</div>
              </div>
              <div className="p-2 space-y-3">
                {/* Custom Command Input */}
                <div>
                  <div className="text-[9px] font-bold text-gray-600 mb-2">
                    CUSTOM COMMAND
                  </div>
                  <CustomCommandControl
                    commandStatus={settingsState.commandStatus}
                    onSendCommand={handleSendCommand}
                  />
                </div>

                {/* System Control Commands */}
                <div>
                  <CommandCategory
                    title="SYSTEM CONTROL"
                    commands={SYSTEM_CONTROL_COMMANDS}
                    type="system"
                    onSendCommand={handleSendCommand}
                  />
                </div>

                {/* Emergency Commands */}
                <div>
                  <CommandCategory
                    title="EMERGENCY"
                    commands={EMERGENCY_COMMANDS}
                    type="emergency"
                    onSendCommand={handleSendCommand}
                  />
                </div>

                {/* Calibration Commands */}
                <div>
                  <CommandCategory
                    title="CALIBRATION"
                    commands={CALIBRATION_COMMANDS}
                    type="calibration"
                    onSendCommand={handleSendCommand}
                  />
                </div>

                {/* Flight Control Commands */}
                <div>
                  <div className="text-[9px] font-bold text-gray-600 mb-2">
                    FLIGHT CONTROL
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FLIGHT_CONTROL_COMMANDS.map((cmd, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendCommand(cmd.command)}
                        className="bg-[rgba(217,217,217,0.5)] border border-[rgba(0,0,0,0.58)] rounded-[2px] px-2 py-[6px] h-[32px] w-[131px] text-[13px] font-medium text-[rgba(0,0,0,0.65)] hover:bg-[rgba(217,217,217,0.8)] transition-colors"
                        title={cmd.command}
                      >
                        {cmd.label}
                      </button>
                    ))}
                    <QnhControl onQnhSet={handleQnhSet} />
                  </div>
                </div>

                {/* SD Card Management */}
                <div>
                  <CommandCategory
                    title="SD CARD"
                    commands={SD_CARD_COMMANDS}
                    type="sdcard"
                    onSendCommand={handleSendCommand}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
