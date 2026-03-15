import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { XBeeStore } from "./types";
import { createTelemetryActions } from "./telemetry-actions";
import { createCommunicationActions } from "./communication-actions";
import { createConnectionActions } from "./connection-actions";
import { createFrameProcessingActions } from "./frame-processing-actions";
import { createTransmissionActions } from "./transmission-actions";
import { createActivityActions } from "./activity-actions";
import { createSystemActions } from "./system-actions";

export { xbeeSelectors } from "./selectors";
export type {
  XBeeStore,
  ActivityItem,
  FrameStats,
  ConnectionStats,
} from "./types";

export const useXBeeStore = create<XBeeStore>()(
  subscribeWithSelector(
    immer((set, get) => {
      // Create action groups
      const telemetryActions = createTelemetryActions(set, get);
      const communicationActions = createCommunicationActions(set, get);
      const connectionActions = createConnectionActions(set, get);
      const frameProcessingActions = createFrameProcessingActions(set, get);
      const transmissionActions = createTransmissionActions(set, get);
      const activityActions = createActivityActions(set, get);
      const systemActions = createSystemActions(set, get);

      return {
        telemetry: {
          history: [],
          lastUpdate: null,
          dataRate: 0,
          missionStartTime: null,
          totalMissionTime: 0,
        },

        communication: {
          commandEchoHistory: [],
          logEntries: [],
          rssi: {
            uplink: null,
            downlink: null,
            lastUpdate: null,
          },
          rssiPolling: {
            isActive: false,
            interval: 5000, // 5 seconds default
            lastPollTime: null,
            timerId: null,
          },
        },

        connection: {
          isConnected: false,
          availablePorts: [],
          selectedPort: null,
          connectionTime: null,
          autoDetecting: false,
        },

        statistics: {
          packetsReceived: 0,
          packetsSent: 0,
          errorsCount: 0,
          processingErrors: 0,
          totalFramesProcessed: 0,
          frameStats: {
            telemetryCount: 0,
            commandEchoCount: 0,
            logEntryCount: 0,
            unknownCount: 0,
          },
        },

        activity: {
          log: [],
        },

        ...telemetryActions,
        ...communicationActions,
        ...connectionActions,
        ...frameProcessingActions,
        ...transmissionActions,
        ...activityActions,
        ...systemActions,
      };
    })
  )
);
