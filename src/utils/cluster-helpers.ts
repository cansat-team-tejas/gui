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
 * Check if cluster ID is valid
 */
export const isValidClusterId = (clusterId: number): boolean => {
  return Object.values(CLUSTER_IDS).includes(clusterId as any);
};

/**
 * Get cluster name for logging
 */
export const getClusterName = (clusterId: number): string => {
  const type = getPacketTypeFromClusterId(clusterId);
  return type === "UNKNOWN" ? `UNKNOWN_0x${clusterId.toString(16).toUpperCase()}` : type;
};

/**
 * Format explicit frame metadata for display
 */
export const formatExplicitMetadata = (metadata: {
  sourceEndpoint: number;
  destinationEndpoint: number;
  clusterId: number;
  profileId: number;
}): string => {
  return [
    `SrcEP:0x${metadata.sourceEndpoint.toString(16).toUpperCase()}`,
    `DstEP:0x${metadata.destinationEndpoint.toString(16).toUpperCase()}`,
    `Cluster:0x${metadata.clusterId.toString(16).toUpperCase()}`,
    `Profile:0x${metadata.profileId.toString(16).toUpperCase()}`,
  ].join(" ");
};
