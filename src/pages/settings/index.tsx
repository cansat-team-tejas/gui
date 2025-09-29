/**
 * Settings Page - Main Component
 * Modular settings page with RHF and Zod validation
 */
import { AutoConnectButton } from "../../components/auto-connect-button";
import { GuiResetButton } from "../../components/gui-reset-button";
import { RSSIPollingControl } from "../../components/rssi-polling-control";
import Panel from "../../components/panel";
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
    <div className="bg-gray-50 flex flex-col w-full h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full space-y-6">
          {/* Connection Status Section */}
          <Panel title="CONNECTION STATUS" variant="default">
            <ConnectionStatusComponent
              connectionStatus={connectionStatus}
              statusMessage={settingsState.connectionStatus}
            />
          </Panel>

          {/* Quick Actions Section */}
          <Panel title="QUICK ACTIONS" variant="default">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Auto-Detect XBee
                  </div>
                  <AutoConnectButton />
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    RSSI Monitoring
                  </div>
                  <RSSIPollingControl />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    System Reset
                  </div>
                  <GuiResetButton className="w-full" />
                </div>
              </div>
            </div>
          </Panel>
          {/* Port Configuration Section */}
          <Panel title="PORT CONFIGURATION" variant="default">
            <PortSelection
              availablePorts={availablePorts}
              selectedPort={selectedPort}
              isConnected={isConnected}
              isScanning={settingsState.isScanning}
              onScanPorts={handleScanPorts}
              onPortSelect={setSelectedPort}
            />
          </Panel>

          {/* Manual Connection Section */}
          <Panel title="MANUAL CONNECTION" variant="default">
            <ConnectionControls
              isConnected={isConnected}
              selectedPort={selectedPort}
              isConnecting={settingsState.isConnecting}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </Panel>

          {/* Command Control Section */}
          {isConnected && (
            <Panel
              title="COMMAND CONTROL"
              variant="default"
              collapsible
              defaultCollapsed
            >
              <div className="space-y-6">
                {/* Custom Command Input */}
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Custom Command
                  </div>
                  <CustomCommandControl
                    commandStatus={settingsState.commandStatus}
                    onSendCommand={handleSendCommand}
                  />
                </div>

                {/* Command Categories */}
                <div className="grid grid-cols-1 gap-6">
                  <CommandCategory
                    title="SYSTEM CONTROL"
                    commands={SYSTEM_CONTROL_COMMANDS}
                    type="system"
                    onSendCommand={handleSendCommand}
                  />

                  <CommandCategory
                    title="EMERGENCY"
                    commands={EMERGENCY_COMMANDS}
                    type="emergency"
                    onSendCommand={handleSendCommand}
                  />

                  <CommandCategory
                    title="CALIBRATION"
                    commands={CALIBRATION_COMMANDS}
                    type="calibration"
                    onSendCommand={handleSendCommand}
                  />

                  {/* Flight Control Commands */}
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Flight Control
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FLIGHT_CONTROL_COMMANDS.map((cmd, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendCommand(cmd.command)}
                          className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-3 py-2 text-xs font-medium text-gray-700 transition-colors duration-150"
                          title={cmd.command}
                        >
                          {cmd.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <QnhControl onQnhSet={handleQnhSet} />
                    </div>
                  </div>

                  <CommandCategory
                    title="SD CARD"
                    commands={SD_CARD_COMMANDS}
                    type="sdcard"
                    onSendCommand={handleSendCommand}
                  />
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
