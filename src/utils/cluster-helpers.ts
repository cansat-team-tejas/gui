/**
 * XBee Explicit Frame Cluster ID Helpers
 * Utilities for filtering and processing frames by cluster ID
 */
import { CLUSTER_IDS } from "../constants";

/**
 * Get packet type name from cluster ID
 */
export const getPacketTypeFromClusterId = (
  clusterId: number
): "TELEMETRY" | "LOG" | "CMD_RESPONSE" | "UNKNOWN" => {
  switch (clusterId) {
    case CLUSTER_IDS.TELEMETRY:
      return "TELEMETRY";
    case CLUSTER_IDS.LOG:
      return "LOG";
    case CLUSTER_IDS.CMD_RESPONSE:
      return "CMD_RESPONSE";
    default:
      return "UNKNOWN";
  }
};

/**
 * Get cluster name for logging
 */
export const getClusterName = (clusterId: number): string => {
  const type = getPacketTypeFromClusterId(clusterId);
  return type === "UNKNOWN"
    ? `UNKNOWN_0x${clusterId.toString(16).toUpperCase()}`
    : type;
};
