import { useCallback } from "react";
import { MissionContext } from "./use-mission-context";
import { useSettingsState } from "../../settings/hooks";
import { createMCPService } from "../../../utils/mcp-service";

export interface AIResponse {
  response: string;
  commandExecuted?: string;
}

export const useAIService = () => {
  const settingsState = useSettingsState();

  const buildCurrentRowPayload = (context: MissionContext) => {
    const row = context.currentRow;
    return {
      TEAM_ID: row.TEAM_ID,
      mission_time_s: row.MISSION_TIME_S,
      packet_count: row.PACKET_COUNT,
      altitude: row.ALTITUDE,
      pressure: row.PRESSURE,
      temperature: row.TEMPERATURE,
      voltage: row.VOLTAGE,
      gnss_time: row.GNSS_TIME,
      latitude: row.LATITUDE,
      longitude: row.LONGITUDE,
      gps_altitude: row.GPS_ALTITUDE,
      satellites: row.SATELLITES,
      accel_x: row.ACCEL_X,
      accel_y: row.ACCEL_Y,
      accel_z: row.ACCEL_Z,
      gyro_spin_rate: row.GYRO_SPIN_RATE,
      flight_state: row.FLIGHT_STATE,
      gyro_x: row.GYRO_X,
      gyro_y: row.GYRO_Y,
      gyro_z: row.GYRO_Z,
      roll: row.ROLL,
      pitch: row.PITCH,
      yaw: row.YAW,
      mag_x: row.MAG_X,
      mag_y: row.MAG_Y,
      mag_z: row.MAG_Z,
      humidity: row.HUMIDITY,
      current: row.CURRENT,
      power: row.POWER,
      baro_altitude: row.BARO_ALTITUDE,
      mcu_temp_c: row.MCU_TEMP_C,
      rssi_dbm: row.RSSI_DBM,
      rtc_epoch: row.RTC_EPOCH,
      cmd_echo: row.CMD_ECHO,
      log_data: row.LOG_DATA,
    };
  };

  const executeCommand = useCallback(
    async (command: string): Promise<string> => {


      return `Command "${command}" sent to CanSat`;
    },
    []
  );

  const processAIResponse = useCallback(
    async (
      userMessage: string,
      context: MissionContext
    ): Promise<AIResponse> => {
      // Call remote MCP AI service (/ask) if available
      try {
        const mcpService = createMCPService(settingsState.aiServicePort);
        const response = await mcpService.askQuestion(
          userMessage,
          buildCurrentRowPayload(context)
        );

        // The service returns { answer: { content }, command }
        const answer =
          typeof response.answer === "string"
            ? response.answer
            : response.answer?.content || "";
        const command = response.command || null;

        console.log("AI Service Response:", { answer, command });

        if (command) {
          console.log(
            "Command detected, opening confirmation dialog:",
            command
          );
          // Start timeout countdown
          let timeLeft = 30;
          const updateTimer = () => {
            timeLeft -= 1;
            settingsState.setConfirmationState((prev) => ({
              ...prev,
              timeRemaining: timeLeft,
            }));

            if (timeLeft <= 0) {
              // Timeout expired
              settingsState.setConfirmationState({
                isOpen: false,
                command: null,
                timeoutId: null,
                timeRemaining: 30,
              });
            }
          };

          const intervalId = setInterval(updateTimer, 1000);

          // Set initial confirmation state with timeout
          settingsState.setConfirmationState({
            isOpen: true,
            command,
            timeoutId: intervalId,
            timeRemaining: 30,
          });

          console.log("Confirmation dialog state set:", {
            isOpen: true,
            command,
            timeRemaining: 30,
          });

          // Auto-clear after 30 seconds
          setTimeout(() => {
            clearInterval(intervalId);
          }, 30000);

          return { response: answer, commandExecuted: command };
        }

        return { response: answer };
      } catch (err) {
        // Fallback to local heuristics if the AI service is unavailable
        console.warn(
          "AI service call failed, falling back to local logic:",
          err
        );
        const lowerMessage = userMessage.toLowerCase();

        // Add test command for debugging
        if (lowerMessage.includes("test command")) {
          const testCommand = "TEST";
          console.log(
            "Test command detected, opening confirmation dialog:",
            testCommand
          );

          // Start timeout countdown
          let timeLeft = 30;
          const updateTimer = () => {
            timeLeft -= 1;
            settingsState.setConfirmationState((prev) => ({
              ...prev,
              timeRemaining: timeLeft,
            }));

            if (timeLeft <= 0) {
              settingsState.setConfirmationState({
                isOpen: false,
                command: null,
                timeoutId: null,
                timeRemaining: 30,
              });
            }
          };

          const intervalId = setInterval(updateTimer, 1000);

          settingsState.setConfirmationState({
            isOpen: true,
            command: testCommand,
            timeoutId: intervalId,
            timeRemaining: 30,
          });

          setTimeout(() => {
            clearInterval(intervalId);
          }, 30000);

          return {
            response:
              "Test command detected! Please confirm to execute the TEST command.",
            commandExecuted: testCommand,
          };
        }

        if (lowerMessage.includes("start") && lowerMessage.includes("cansat")) {
          await executeCommand("START");
          return {
            response:
              "I've sent the START command to the CanSat. The mission should begin shortly. I'll monitor the telemetry data for you.",
            commandExecuted: "START",
          };
        }

        if (
          lowerMessage.includes("stop") ||
          lowerMessage.includes("emergency")
        ) {
          await executeCommand("EMERGENCY");
          return {
            response:
              "Emergency command sent! The CanSat has been instructed to stop current operations.",
            commandExecuted: "EMERGENCY",
          };
        }

        // Basic status reply as fallback
        return {
          response: `Unable to reach AI service. Quick status: Connection: ${
            context.isConnected ? "Connected" : "Disconnected"
          }, Mission time: ${context.telemetry.missionTime.toFixed(1)}s`,
        };
      }
    },
    [executeCommand]
  );

  return { processAIResponse };
};
