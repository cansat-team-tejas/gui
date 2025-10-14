/**
 * Settings Page - Main Component
 * Modular settings page with RHF and Zod validation
 */
import { GuiResetButton } from "../../components/gui-reset-button";
import Panel from "../../components/panel";
import ConfirmationDialog from "../../components/confirmation-dialog";
import { useIsConnected } from "../../hooks/use-xbee-go";
import ErrorBoundary from "../../components/error-boundary";

// Settings components
import {
  ConnectionStatusComponent,
  BackendStatusComponent,
  CustomCommandControl,
  CommandCategory,
} from "./components";

// Settings hooks and constants
import { useSettingsState, useCommandManagement } from "./hooks";
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

  // Settings state management
  const settingsState = useSettingsState();

  // Custom hooks for functionality
  const { handleSendCommand, handleConfirmCommand, handleCancelCommand } =
    useCommandManagement(settingsState);

  return (
    <div className="bg-gray-50 flex flex-col w-full h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full space-y-6">
          <ErrorBoundary>
            <ConnectionStatusComponent />
          </ErrorBoundary>

          <ErrorBoundary>
            <Panel title="BACKEND STATUS" variant="default">
              <BackendStatusComponent />
            </Panel>
          </ErrorBoundary>

          <Panel title="QUICK ACTIONS" variant="default">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  System Reset
                </div>
                <GuiResetButton className="w-full" />
              </div>
            </div>
          </Panel>

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
