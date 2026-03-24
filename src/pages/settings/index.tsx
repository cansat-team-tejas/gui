import { AutoConnectButton } from "../../components/auto-connect-button";
import { GuiResetButton } from "../../components/gui-reset-button";
import { RSSIPollingControl } from "../../components/rssi-polling-control";
import Panel from "../../components/panel";
import ConfirmationDialog from "../../components/confirmation-dialog";
import { Play, Square, RotateCcw, Activity } from "lucide-react";
import {
  useIsConnected,
  useAvailablePorts,
  useSelectedPort,
  useSetSelectedPort,
} from "../../hooks/use-xbee";
import { useSimulationStore } from "../../store/simulation";
import { useConfigStore } from "../../store/config";

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
  COMMUNICATION_COMMANDS,
  FLIGHT_CONTROL_COMMANDS,
  RTC_TIME_COMMANDS,
  MCU_MONITORING_COMMANDS,
} from "./constants";

const SettingsPage: React.FC = () => {
  // XBee store hooks
  const isConnected = useIsConnected();
  const availablePorts = useAvailablePorts();
  const selectedPort = useSelectedPort();
  const setSelectedPort = useSetSelectedPort();

  // Settings state management
  const settingsState = useSettingsState();

  const simMode = useSimulationStore((s) => s.mode);
  const simRunning = useSimulationStore((s) => s.isRunning);
  const simElapsed = useSimulationStore((s) => s.elapsedSeconds);
  const setSimMode = useSimulationStore((s) => s.setMode);
  const simStart = useSimulationStore((s) => s.start);
  const simStop = useSimulationStore((s) => s.stop);
  const simReset = useSimulationStore((s) => s.reset);

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

          {/* Simulation Mode Section */}
          <Panel title="SIMULATION MODE" variant="default">
            <div className="space-y-3">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Data Source
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSimMode("gui")}
                  className={`flex-1 py-2 text-[10px] font-black tracking-wider border border-black transition-colors ${
                    simMode === "gui"
                      ? "bg-[#FFAB00] text-black"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  GUI SIMULATION
                </button>
                <button
                  onClick={() => setSimMode("cansat")}
                  className={`flex-1 py-2 text-[10px] font-black tracking-wider border border-black transition-colors ${
                    simMode === "cansat"
                      ? "bg-[#00AD57] text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  CANSAT HARDWARE
                </button>
              </div>

              {simMode === "gui" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={simStart}
                    disabled={simRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-black bg-[#00AD57] text-white disabled:opacity-40"
                  >
                    <Play size={11} /> START
                  </button>
                  <button
                    onClick={simStop}
                    disabled={!simRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-black bg-gray-800 text-white disabled:opacity-40"
                  >
                    <Square size={11} /> STOP
                  </button>
                  <button
                    onClick={simReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-black bg-white hover:bg-gray-100"
                  >
                    <RotateCcw size={11} /> RESET
                  </button>
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-gray-600">
                    <Activity size={11} className={simRunning ? "text-[#00AD57]" : "text-gray-400"} />
                    T+{simElapsed.toFixed(1)}s
                  </span>
                </div>
              )}

              {simMode === "cansat" && (
                <p className="text-[10px] text-gray-500">
                  Connect your XBee hardware below to receive live data from the CanSat.
                </p>
              )}
            </div>
          </Panel>

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

            <div className="mt-4 border border-black p-3 bg-white">
              <div className="text-[10px] font-bold tracking-widest text-black mb-2 uppercase">
                XBee Target Definition (DH / DL)
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1">
                    DESTINATION HIGH (DH)
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={useConfigStore().xbeeDH}
                    onChange={(e) => useConfigStore.getState().setXbeeDH(e.target.value.toUpperCase())}
                    className="w-full border border-black px-2 py-1.5 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1">
                    DESTINATION LOW (DL)
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={useConfigStore().xbeeDL}
                    onChange={(e) => useConfigStore.getState().setXbeeDL(e.target.value.toUpperCase())}
                    className="w-full border border-black px-2 py-1.5 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
              <div className="mt-2 text-[9px] text-gray-500">
                These settings configure the 64-bit destination address for outgoing packets. Leave as defaults unless using a custom receiver.
              </div>
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
                    title="COMMUNICATION"
                    commands={COMMUNICATION_COMMANDS}
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
                </div>
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
