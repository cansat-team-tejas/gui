import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RhfTextField from "../rhf-text-field";
import Button from "../button";
import LabelValue from "../label-value";
import { commandFormSchema, type CommandFormData } from "../../schemas/forms";
import { useXBeeStore } from "../../store/xbee";

interface XBeeCommandFormProps {
  onCommand: (data: CommandFormData) => void;
  isConnected: boolean;
  disabled?: boolean;
}

const XBeeCommandForm: React.FC<XBeeCommandFormProps> = ({
  onCommand,
  isConnected,
  disabled = false,
}) => {
  const methods = useForm<CommandFormData>({
    resolver: zodResolver(commandFormSchema),
    defaultValues: {
      command: "",
      teamId: "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  // Get store actions for GUI reset
  const clearTelemetry = useXBeeStore((state) => state.clearTelemetry);
  const resetProcessingStats = useXBeeStore(
    (state) => state.resetProcessingStats
  );
  const clearCommandHistory = useXBeeStore(
    (state) => state.clearCommandHistory
  );
  const clearLogEntries = useXBeeStore((state) => state.clearLogEntries);
  const clearActivityLog = useXBeeStore((state) => state.clearActivityLog);

  const onSubmit = async (data: CommandFormData) => {
    try {
      await onCommand({
        ...data,
      });
      reset();
    } catch (error) {
      console.error("Command submission failed:", error);
    }
  };

  // Updated command list based on actual available commands
  const systemCommands = [
    { label: "START_TX", value: "START_TX", description: "Start transmission" },
    { label: "STOP_TX", value: "STOP_TX", description: "Stop transmission" },
    { label: "STATUS", value: "STATUS", description: "Get system status" },
    { label: "START", value: "START", description: "Start mission" },
  ];

  const calibrationCommands = [
    {
      label: "CAL_GYRO",
      value: "CAL_GYRO",
      description: "Calibrate gyroscope",
    },
    {
      label: "CAL_BARO",
      value: "CAL_BARO",
      description: "Calibrate barometer",
    },
    {
      label: "CAL_ACCEL",
      value: "CAL_ACCEL",
      description: "Calibrate accelerometer",
    },
    {
      label: "CAL_SENSORS",
      value: "CAL_SENSORS",
      description: "Calibrate all sensors",
    },
  ];

  const operationCommands = [
    { label: "RESET", value: "RESET", description: "Reset system" },
    {
      label: "RESET_CONFIRM",
      value: "RESET_CONFIRM",
      description: "Confirm reset",
    },
    {
      label: "DEPLOY_SECONDARY",
      value: "DEPLOY_SECONDARY",
      description: "Deploy secondary system",
    },
    {
      label: "EMERGENCY",
      value: "EMERGENCY",
      description: "Emergency command",
    },
    { label: "QNH", value: "QNH", description: "Set QNH pressure" },
  ];

  const dataCommands = [
    { label: "SD_CLEAN", value: "SD_CLEAN", description: "Clean SD card" },
    { label: "SD_INFO", value: "SD_INFO", description: "Get SD card info" },
    {
      label: "SD_LIST",
      value: "SD_LIST",
      description: "List SD card contents",
    },
    {
      label: "SD_DIR_INFO",
      value: "SD_DIR_INFO",
      description: "Get directory info",
    },
    {
      label: "SD_DIR_DELETE",
      value: "SD_DIR_DELETE",
      description: "Delete directory",
    },
  ];

  const handleQuickCommand = (command: string) => {
    methods.setValue("command", command);
    handleSubmit(onSubmit)();
  };

  const handleGuiReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all GUI data? This will clear all telemetry history, logs, and statistics."
      )
    ) {
      clearTelemetry();
      resetProcessingStats();
      clearCommandHistory();
      clearLogEntries();
      clearActivityLog();

      // Show confirmation
      alert("GUI state has been reset successfully!");
    }
  };

  const isFormDisabled = disabled || !isConnected;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2 items-end">
          <LabelValue
            label="XBEE COMMAND"
            containerClassName="grid grid-cols-1 gap-1 flex-1"
            labelClassName="text-[10px] font-bold"
          >
            <RhfTextField
              name="command"
              placeholder="Enter XBee command (e.g., CMD,2024,CAL)"
              className={`flex-1 ${
                isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </LabelValue>

          <Button
            type="submit"
            variant="success"
            disabled={isFormDisabled || isSubmitting}
            className="h-[25px] px-4"
          >
            {isSubmitting ? "SENDING..." : "SEND"}
          </Button>
        </div>

        {/* Display validation errors */}
        {errors.command && (
          <div className="text-red-600 text-[10px] font-bold">
            {errors.command.message}
          </div>
        )}

        {/* Connection status indicator */}
        {!isConnected && (
          <div className="text-orange-600 text-[10px] font-bold">
            XBee not connected - commands disabled
          </div>
        )}

        {/* Quick command buttons */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold text-black">
            QUICK COMMANDS:
          </div>

          {/* GUI Reset Button */}
          <div className="mb-3">
            <div className="text-[9px] font-bold text-red-600 mb-1">
              GUI CONTROLS:
            </div>
            <Button
              type="button"
              variant="warning"
              onClick={handleGuiReset}
              disabled={isSubmitting}
              className="text-[9px] px-3 py-1 h-7 bg-red-600 hover:bg-red-700 text-white"
              title="Reset all GUI data (telemetry, logs, statistics)"
            >
              RESET GUI
            </Button>
          </div>

          {/* System Commands */}
          <div>
            <div className="text-[9px] font-bold text-blue-600 mb-1">
              SYSTEM:
            </div>
            <div className="grid grid-cols-4 gap-1">
              {systemCommands.map((cmd) => (
                <Button
                  key={cmd.label}
                  type="button"
                  variant="default"
                  onClick={() => handleQuickCommand(cmd.value)}
                  disabled={isFormDisabled || isSubmitting}
                  className="text-[8px] px-1 py-1 h-6"
                  title={cmd.description}
                >
                  {cmd.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Calibration Commands */}
          <div>
            <div className="text-[9px] font-bold text-green-600 mb-1">
              CALIBRATION:
            </div>
            <div className="grid grid-cols-4 gap-1">
              {calibrationCommands.map((cmd) => (
                <Button
                  key={cmd.label}
                  type="button"
                  variant="default"
                  onClick={() => handleQuickCommand(cmd.value)}
                  disabled={isFormDisabled || isSubmitting}
                  className="text-[8px] px-1 py-1 h-6"
                  title={cmd.description}
                >
                  {cmd.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Operation Commands */}
          <div>
            <div className="text-[9px] font-bold text-orange-600 mb-1">
              OPERATIONS:
            </div>
            <div className="grid grid-cols-3 gap-1">
              {operationCommands.map((cmd) => (
                <Button
                  key={cmd.label}
                  type="button"
                  variant="default"
                  onClick={() => handleQuickCommand(cmd.value)}
                  disabled={isFormDisabled || isSubmitting}
                  className="text-[8px] px-1 py-1 h-6"
                  title={cmd.description}
                >
                  {cmd.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Data Commands */}
          <div>
            <div className="text-[9px] font-bold text-purple-600 mb-1">
              DATA MANAGEMENT:
            </div>
            <div className="grid grid-cols-3 gap-1">
              {dataCommands.map((cmd) => (
                <Button
                  key={cmd.label}
                  type="button"
                  variant="default"
                  onClick={() => handleQuickCommand(cmd.value)}
                  disabled={isFormDisabled || isSubmitting}
                  className="text-[8px] px-1 py-1 h-6"
                  title={cmd.description}
                >
                  {cmd.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Command format help */}
        <div className="bg-gray-50 p-2 rounded border text-[9px] space-y-1">
          <div className="font-bold">COMMAND FORMAT:</div>
          <div>• Direct Commands: START_TX, STOP_TX, STATUS, etc.</div>
          <div>• QNH Command: QNH,1013.25 (pressure in hPa)</div>
          <div>• Directory Commands: SD_DIR_DELETE,dirname</div>
          <div>• Example: START_TX (starts telemetry transmission)</div>
          <div>• Max length: 50 characters</div>
          <div className="text-red-600 font-bold">
            ⚠ RESET commands require confirmation!
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default XBeeCommandForm;
