/**
 * XBee Store - Frame Processing Actions
 */
import { FrameParser } from "../../utils/frame-parser";
import type { ICommandType, ILogEntryType } from "../../types/telemetry";
import { FRAME_TYPES } from "../../constants";
import type { XBeeStore, FrameProcessingActions } from "./types";

export const createFrameProcessingActions = (
  set: any,
  get: () => XBeeStore
): FrameProcessingActions => ({
  processFrame: (raw: string) => {
    try {
      const parsed = FrameParser.parseFrame(raw);
      const store = get();

      // Process different frame types
      switch (parsed.type) {
        case FRAME_TYPES.TELEMETRY:
          if (parsed.data) {
            const rawData = parsed.data as any;

            // Store the complete telemetry data
            store.updateTelemetry(rawData);

            // Extract and store command echo if present
            if (rawData.CMD_ECHO && rawData.CMD_ECHO.trim()) {
              const commandEcho: ICommandType = {
                TEAM_ID: rawData.TEAM_ID || "046",
                MISSION_TIME: rawData.MISSION_TIME_S?.toString() || "",
                COMMAND_ECHO: rawData.CMD_ECHO,
                timestamp: new Date(),
              };
              store.addCommandEcho(commandEcho);
            }

            // Extract and store log data if present
            if (rawData.LOG_DATA && rawData.LOG_DATA.trim()) {
              const logEntry: ILogEntryType = {
                TEAM_ID: rawData.TEAM_ID || "046",
                MISSION_TIME: rawData.MISSION_TIME_S?.toString() || "",
                MESSAGE: rawData.LOG_DATA,
                timestamp: new Date(),
              };
              store.addLogEntry(logEntry);
            }
          }
          break;

        case FRAME_TYPES.COMMAND_ECHO:
          if (parsed.data) {
            store.addCommandEcho(parsed.data as ICommandType);
          }
          break;

        case FRAME_TYPES.LOG_ENTRY:
          if (parsed.data) {
            store.addLogEntry(parsed.data as ILogEntryType);
          }
          break;

        case FRAME_TYPES.UNKNOWN:
          // Unknown frames are logged but not processed
          break;
      }

      // Update statistics and activity
      store.addActivity(
        "FRAME_RECEIVED",
        parsed.type,
        `Processed ${parsed.type} frame`
      );

      // Update connection statistics properly
      set((state: XBeeStore) => {
        state.statistics.packetsReceived += 1;
        state.statistics.totalFramesProcessed += 1;
      });
    } catch (error) {
      // Silent fail - frame processing errors are tracked in statistics
      set((state: XBeeStore) => {
        state.statistics.processingErrors += 1;
        state.statistics.errorsCount += 1;
      });
      get().addActivity("ERROR", undefined, "Frame processing failed");
    }
  },

  processATResponse: (frame: any) => {
    try {
      const store = get();

      // Check if this is a DB command response
      if (frame.command === "DB" && frame.status === 0) {
        let rssiValue = frame.value;

        // Convert to proper dBm format if needed
        if (rssiValue && rssiValue > 0) {
          rssiValue = -rssiValue;
        }

        if (rssiValue !== undefined && rssiValue !== null) {
          store.updateRSSI(undefined, rssiValue);
          store.addActivity(
            "FRAME_RECEIVED",
            "AT_RESPONSE",
            `Downlink RSSI: ${rssiValue} dBm`
          );
        }
      }

      // Update statistics
      set((state: XBeeStore) => {
        state.statistics.packetsReceived += 1;
        state.statistics.totalFramesProcessed += 1;
      });
    } catch (error) {
      set((state: XBeeStore) => {
        state.statistics.processingErrors += 1;
        state.statistics.errorsCount += 1;
      });
      get().addActivity("ERROR", undefined, "AT response processing failed");
    }
  },

  resetProcessingStats: () =>
    set((state: XBeeStore) => {
      state.statistics.processingErrors = 0;
      state.statistics.totalFramesProcessed = 0;
    }),
});
