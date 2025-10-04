import { useCallback } from "react";
import { MissionContext } from "./use-mission-context";

export interface AIResponse {
  response: string;
  commandExecuted?: string;
}

export const useAIService = () => {
  const executeCommand = useCallback(
    async (command: string): Promise<string> => {
      // Here you would integrate with your command execution system
      // For now, we'll simulate it

      // You would call your actual command execution function here
      // await onCommand({ command, teamId: "2024" });

      return `Command "${command}" sent to CanSat`;
    },
    []
  );

  const processAIResponse = useCallback(
    async (
      userMessage: string,
      context: MissionContext
    ): Promise<AIResponse> => {
      // Mock AI processing - in real implementation, this would call your AI service
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes("start") && lowerMessage.includes("cansat")) {
        await executeCommand("START");
        return {
          response:
            "I've sent the START command to the CanSat. The mission should begin shortly. I'll monitor the telemetry data for you.",
          commandExecuted: "START",
        };
      }

      if (lowerMessage.includes("stop") || lowerMessage.includes("emergency")) {
        await executeCommand("EMERGENCY");
        return {
          response:
            "Emergency command sent! The CanSat has been instructed to stop current operations.",
          commandExecuted: "EMERGENCY",
        };
      }

      if (
        lowerMessage.includes("status") ||
        (lowerMessage.includes("how") && lowerMessage.includes("doing"))
      ) {
        return {
          response: `Current CanSat Status:
• Connection: ${context.isConnected ? "Connected" : "Disconnected"}
• Altitude: ${context.telemetry.altitude.toFixed(
            1
          )}m (Barometric), ${context.telemetry.gpsAltitude.toFixed(1)}m (GPS)
• Temperature: ${context.telemetry.temperature.toFixed(1)}°C
• Mission Time: ${context.telemetry.missionTime.toFixed(1)}s
• GPS Satellites: ${context.telemetry.satellites}
• Signal Strength: ${context.systemStatus.rssi}dBm
• Air Quality: ${context.systemStatus.airQuality.toFixed(1)} PPM

Everything looks ${
            context.isConnected ? "good" : "concerning - no connection"
          }!`,
        };
      }

      if (lowerMessage.includes("altitude")) {
        return {
          response: `Current altitude readings:
• Barometric Altitude: ${context.telemetry.altitude.toFixed(1)} meters
• GPS Altitude: ${context.telemetry.gpsAltitude.toFixed(1)} meters
• Difference: ${Math.abs(
            context.telemetry.altitude - context.telemetry.gpsAltitude
          ).toFixed(1)}m

${
  context.telemetry.altitude > 1000
    ? "CanSat is at significant altitude!"
    : "CanSat is at low altitude."
}`,
        };
      }

      if (
        lowerMessage.includes("gps") ||
        lowerMessage.includes("coordinates")
      ) {
        return {
          response: `GPS Information:
• Coordinates: ${context.telemetry.coordinates.lat.toFixed(
            6
          )}°N, ${context.telemetry.coordinates.lon.toFixed(6)}°E
• GPS Altitude: ${context.telemetry.gpsAltitude.toFixed(1)} meters
• Satellites: ${context.telemetry.satellites} satellites in view
• GPS Status: ${
            context.telemetry.satellites >= 4
              ? "Good GPS lock"
              : "Poor GPS signal"
          }`,
        };
      }

      if (
        lowerMessage.includes("temperature") ||
        lowerMessage.includes("temp")
      ) {
        return {
          response: `Temperature Monitoring:
• Current Temperature: ${context.telemetry.temperature.toFixed(1)}°C
• Status: ${
            context.telemetry.temperature < 0
              ? "Below freezing"
              : context.telemetry.temperature > 30
              ? "High temperature"
              : "Normal range"
          }
• Humidity: ${context.telemetry.humidity.toFixed(1)}%`,
        };
      }

      if (
        lowerMessage.includes("diagnostic") ||
        lowerMessage.includes("system")
      ) {
        return {
          response: `System Diagnostics:
• Power: ${context.telemetry.voltage.toFixed(1)}V
• Signal: ${context.systemStatus.rssi}dBm
• Mission Time: ${(context.telemetry.missionTime / 60).toFixed(1)} minutes
• Air Quality: ${context.systemStatus.airQuality.toFixed(1)} PPM
• System Health: ${
            context.isConnected && context.telemetry.voltage > 3.0
              ? "Good"
              : "Check required"
          }`,
        };
      }

      // Default response
      return {
        response: `Based on the current mission data, I can help you with:
• Mission status and telemetry analysis
• Sending commands (START, STOP, EMERGENCY, etc.)
• Data interpretation and insights
• System monitoring and alerts

Current mission time: ${context.telemetry.missionTime.toFixed(
          1
        )}s. What would you like to know or do?`,
      };
    },
    [executeCommand]
  );

  return { processAIResponse };
};
