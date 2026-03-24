import { CLUSTER_IDS } from "../constants";

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

export const getClusterName = (clusterId: number): string => {
  const type = getPacketTypeFromClusterId(clusterId);
  return type === "UNKNOWN"
    ? `UNKNOWN_0x${clusterId.toString(16).toUpperCase()}`
    : type;
};
