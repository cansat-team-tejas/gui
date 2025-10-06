/**
 * Settings Page - Main Component
 * Modular settings page with RHF and Zod validation
 */
import { AutoConnectButton } from "../../components/auto-connect-button";
import { GuiResetButton } from "../../components/gui-reset-button";
import { RSSIPollingControl } from "../../components/rssi-polling-control";
import Panel from "../../components/panel";
import ConfirmationDialog from "../../components/confirmation-dialog";
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
} from "./components";
import { AIServiceConfig } from "./components";

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
  REACTION_WHEEL_COMMANDS,
  SD_CARD_COMMANDS,
  RTC_TIME_COMMANDS,
  MCU_MONITORING_COMMANDS,
  HARDWARE_RESET_COMMANDS,
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
  const { handleSendCommand, handleConfirmCommand, handleCancelCommand } =
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

            <div className="mt-4">
              <AIServiceConfig
                port={settingsState.aiServicePort}
                onPortChange={(p) => settingsState.setAiServicePort(p)}
              />
            </div>
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
                <CustomCommandControl
                  commandStatus={settingsState.commandStatus}
                  onSendCommand={handleSendCommand}
                />

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

                  <CommandCategory
                    title="RTC TIME MANAGEMENT"
                    commands={RTC_TIME_COMMANDS}
                    type="system"
                    onSendCommand={handleSendCommand}
                  />

                  <CommandCategory
                    title="MCU MONITORING"
                    commands={MCU_MONITORING_COMMANDS}
                    type="system"
                    onSendCommand={handleSendCommand}
                  />

                  <CommandCategory
                    title="HARDWARE RESET"
                    commands={HARDWARE_RESET_COMMANDS}
                    type="system"
                    onSendCommand={handleSendCommand}
                  />

                  <CommandCategory
                    title="FLIGHT CONTROL"
                    commands={FLIGHT_CONTROL_COMMANDS}
                    type="flight"
                    onSendCommand={handleSendCommand}
                  />

                  <CommandCategory
                    title="REACTION WHEEL"
                    commands={REACTION_WHEEL_COMMANDS}
                    type="system"
                    onSendCommand={handleSendCommand}
                  />
                </div>

                <CommandCategory
                  title="SD CARD"
                  commands={SD_CARD_COMMANDS}
                  type="sdcard"
                  onSendCommand={handleSendCommand}
                />
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Critical Command Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={settingsState.confirmationState.isOpen}
        title="CRITICAL COMMAND CONFIRMATION"
        message={
          settingsState.confirmationState.command
            ? `Are you sure you want to send the critical command: ${settingsState.confirmationState.command}?\n\nThis command will be executed immediately upon confirmation and may affect flight operations.`
            : ""
        }
        confirmText={`SEND COMMAND (${settingsState.confirmationState.timeRemaining}s)`}
        cancelText="CANCEL"
        onConfirm={handleConfirmCommand}
        onCancel={handleCancelCommand}
        isDangerous={true}
      />
    </div>
  );
};

export default SettingsPage;
