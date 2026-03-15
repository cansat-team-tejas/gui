import { useEffect } from "react";
import { useXBeeStore } from "../store/xbee";
import { CLUSTER_IDS } from "../constants";
import { getClusterName } from "../utils/cluster-helpers";

/**
 * Subscribes to incoming XBee frames via the Electron IPC bridge and
 * routes them through the store's frame-processing pipeline.
 */
export const useFrameListener = () => {
  const processFrame = useXBeeStore((state) => state.processFrame);
  const processATResponse = useXBeeStore((state) => state.processATResponse);

  useEffect(() => {
    if (!window.electronAPI?.xbee?.onFrameReceived) return;

    const unsubscribe = window.electronAPI.xbee.onFrameReceived(
      (frame: any) => {
        if (frame?.type === "AT_RESPONSE") {
          processATResponse(frame);
          return;
        }

        if (!frame?.data || typeof frame.data !== "string") return;

        const clusterId = frame.explicitMetadata?.clusterId;
        if (clusterId) {
          switch (clusterId) {
            case CLUSTER_IDS.TELEMETRY:
            case CLUSTER_IDS.LOG:
            case CLUSTER_IDS.CMD_RESPONSE:
              processFrame(frame.data);
              break;
            default:
              console.warn(`Unknown cluster ID: ${getClusterName(clusterId)}`);
              processFrame(frame.data);
          }
        } else {
          processFrame(frame.data);
        }
      }
    );

    return unsubscribe;
  }, [processFrame, processATResponse]);
};
