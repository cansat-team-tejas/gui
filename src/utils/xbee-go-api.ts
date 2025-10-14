/**
 * XBee Go Backend API Service
 * Handles all communication with the Go backend for XBee functionality
 */

import { BACKEND_CONFIG } from "../constants";
import { getMissionRequestFilename } from "./mission-utils";

// Backend Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface XBeeRadioConfig {
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: string;
}

interface XBeeStats {
  packetRate: number;
  packetsReceived: number;
  packetsSent: number;
  lastUpdate?: string;
  startTime?: string;
  lastCommand?: string;
  lastCommandEcho?: string;
  frameStats?: {
    telemetryCount?: number;
    logEntryCount?: number;
    commandEchoCount?: number;
    unknownCount?: number;
  };
}

interface ConnectionHealthStatus {
  connected: boolean;
  status?: string;
  timeSinceLastDataMs?: number;
  lastDataReceived?: string;
  connectionUptime?: string;
  packetsReceived?: number;
  packetsSent?: number;
  healthStatus?: string;
  healthReason?: string;
}

interface TelemetryStatistics {
  totalPackets?: number;
  maxAltitude?: number;
  minAltitude?: number;
  avgAltitude?: number;
  maxTemperature?: number;
  minTemperature?: number;
  avgTemperature?: number;
}

interface MissionInfo {
  id: string;
  name: string;
  startTime: string;
  isActive?: boolean;
  dbPath?: string;
  endTime?: string | null;
  packetCount?: number;
}

type TelemetryRecord = Record<string, unknown>;

interface XBeeStatus {
  connected: boolean;
  port?: string | null;
  config?: XBeeRadioConfig;
  stats?: XBeeStats | null;
  mission?: MissionInfo | null;
  connectionHealth?: ConnectionHealthStatus | null;
}

const isRecord = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === "object";

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseMissionInfo = (mission: any): MissionInfo | null => {
  if (!mission) {
    return null;
  }

  const id = mission.id ?? mission.missionId;
  const startTime = mission.startTime ?? mission.start_time;

  if (!id || !startTime) {
    return null;
  }

  return {
    id,
    name: mission.name ?? mission.missionName ?? id,
    startTime,
    isActive:
      mission.isActive !== undefined
        ? Boolean(mission.isActive)
        : mission.status !== undefined
        ? mission.status === "active"
        : undefined,
    dbPath: mission.dbPath ?? mission.databasePath,
    endTime: mission.endTime ?? mission.end_time ?? null,
    packetCount:
      toNumber(mission.packetCount ?? mission.packetsReceived) ?? undefined,
  };
};

const parseStats = (stats: any): XBeeStats | null => {
  if (!stats) {
    return null;
  }

  return {
    packetRate: toNumber(stats.packetRate ?? stats.packet_rate) ?? 0,
    packetsReceived:
      toNumber(stats.packetsReceived ?? stats.total_packets) ?? 0,
    packetsSent: toNumber(stats.packetsSent ?? stats.sent_packets) ?? 0,
    lastUpdate: stats.lastUpdate ?? stats.last_update,
    startTime: stats.startTime ?? stats.start_time,
    lastCommand: stats.lastCommand ?? stats.last_command,
    lastCommandEcho: stats.lastCommandEcho ?? stats.last_command_echo,
    frameStats: stats.frameStats ?? stats.frame_stats,
  };
};

const parseHealth = (health: any): ConnectionHealthStatus | null => {
  if (!health) {
    return null;
  }

  return {
    connected:
      Boolean(health.is_connected ?? health.connected) ||
      (health.connection_status
        ? health.connection_status !== "disconnected"
        : false),
    status: health.connection_status ?? health.status,
    timeSinceLastDataMs:
      toNumber(health.time_since_last_data_ms ?? health.timeSinceLastDataMs) ??
      undefined,
    lastDataReceived: health.last_data_received ?? health.lastDataReceived,
    connectionUptime: health.connection_uptime ?? health.connectionUptime,
    packetsReceived:
      toNumber(health.packets_received ?? health.packetsReceived) ?? undefined,
    packetsSent:
      toNumber(health.packets_sent ?? health.packetsSent) ?? undefined,
    healthStatus: health.health_status ?? health.healthStatus,
    healthReason: health.health_reason ?? health.healthReason,
  };
};

const parseTelemetryStatistics = (stats: any): TelemetryStatistics => ({
  totalPackets: toNumber(stats?.total_packets ?? stats?.totalPackets),
  maxAltitude: toNumber(stats?.max_altitude ?? stats?.maxAltitude),
  minAltitude: toNumber(stats?.min_altitude ?? stats?.minAltitude),
  avgAltitude: toNumber(stats?.avg_altitude ?? stats?.avgAltitude),
  maxTemperature: toNumber(stats?.max_temperature ?? stats?.maxTemperature),
  minTemperature: toNumber(stats?.min_temperature ?? stats?.minTemperature),
  avgTemperature: toNumber(stats?.avg_temperature ?? stats?.avgTemperature),
});

const buildStatusResponse = (payload: any): XBeeStatus => {
  const connection = payload?.connection ?? {};
  const config = connection.config ?? connection.radioConfig ?? {};

  const status: XBeeStatus = {
    connected:
      Boolean(
        connection.isOpen ?? connection.connected ?? payload?.connected
      ) || false,
    port: connection.port ?? connection.serialPort ?? null,
    config:
      Object.keys(config).length > 0
        ? {
            baudRate: toNumber(config.baudRate),
            dataBits: toNumber(config.dataBits),
            stopBits: toNumber(config.stopBits),
            parity: config.parity,
          }
        : undefined,
    stats: parseStats(payload?.stats),
    mission: parseMissionInfo(payload?.mission),
    connectionHealth: parseHealth(
      payload?.connection_health ?? payload?.connectionHealth
    ),
  };

  return status;
};

const normalizeCommandPayload = (
  commandString: string
): { command: string; data?: string } => {
  const trimmed = commandString.trim();
  if (!trimmed.includes(":")) {
    return { command: trimmed };
  }

  const [command, ...rest] = trimmed.split(":");
  const data = rest.join(":");
  return {
    command,
    data,
  };
};

const mapWebSocketType = (type: string): string => {
  switch (type) {
    case "live_telemetry":
    case "telemetry":
      return "telemetry";
    case "stats_update":
    case "stats":
      return "stats";
    case "connection_status":
    case "status":
      return "status";
    case "mission_update":
    case "mission":
      return "mission";
    case "health_update":
    case "health":
      return "health";
    case "activity":
      return "activity";
    case "error":
    case "ERROR":
      return "error";
    default:
      return type;
  }
};

// WebSocket Message Types
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

class XBeeGoAPIService {
  private baseURL: string;
  private websocket: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private activeMissionFilename: string | null = null;

  constructor(baseURL = BACKEND_CONFIG.BACKEND_URL) {
    this.baseURL = baseURL;
  }

  private setActiveMission(mission: MissionInfo | null | undefined): void {
    const filename = getMissionRequestFilename(mission?.dbPath, mission?.name);

    if (filename) {
      this.activeMissionFilename = filename;
    }
  }

  // ============================================================================
  // COMMAND AND CONTROL
  // ============================================================================

  async sendCommand(rawCommand: string): Promise<{
    success: boolean;
    mission?: MissionInfo | null;
    message?: string;
  }> {
    try {
      const payload = normalizeCommandPayload(rawCommand);
      const response = await fetch(`${this.baseURL}/api/xbee/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: payload.command,
          data: payload.data ?? "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to send command");
      }

      const mission = parseMissionInfo(result.mission) ?? undefined;
      this.setActiveMission(mission ?? null);

      return {
        success: Boolean(result.success),
        mission,
        message: result.message ?? result.error,
      };
    } catch (error) {
      console.error("Failed to send command to XBee backend:", error);
      throw error;
    }
  }

  /**
   * Get current XBee connection status
   */
  async getStatus(): Promise<XBeeStatus> {
    try {
      const response = await fetch(`${this.baseURL}/api/xbee/status`);
      const result = await response.json();

      if (result.success) {
        const status = buildStatusResponse(result);
        this.setActiveMission(status.mission);
        return status;
      }
      throw new Error(result.error || "Failed to get status");
    } catch (error) {
      console.error("Failed to get XBee status:", error);
      throw error;
    }
  }

  // ============================================================================
  // MISSION MANAGEMENT
  // ============================================================================

  /**
   * Get current active mission
   */
  async getCurrentMission(): Promise<MissionInfo | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/xbee/mission`);
      const result = await response.json();

      if (result.success) {
        const mission = parseMissionInfo(result.mission) ?? null;
        this.setActiveMission(mission ?? undefined);
        return mission;
      }
      throw new Error(result.error || "Failed to get current mission");
    } catch (error) {
      console.error("Failed to get current mission:", error);
      throw error;
    }
  }

  /**
   * End current mission
   */
  async endMission(): Promise<boolean> {
    try {
      const result = await this.sendCommand("STOP");
      return result.success;
    } catch (error) {
      console.error("Failed to end mission:", error);
      throw error;
    }
  }

  // ============================================================================
  // TELEMETRY DATA
  // ============================================================================

  /**
   * Get telemetry data with optional pagination and filtering
   */
  async getTelemetryData(options?: {
    filename?: string;
    limit?: number;
    offset?: number;
    startTime?: string;
    endTime?: string;
  }): Promise<TelemetryRecord[]> {
    try {
      const { filename: overrideFilename, ...rest } = options ?? {};

      const filename = getMissionRequestFilename(
        overrideFilename,
        this.activeMissionFilename ?? undefined
      );

      if (!filename) {
        throw new Error(
          "Mission filename is not available. Start a mission before requesting telemetry data."
        );
      }

      const payload: Record<string, unknown> = { filename };
      if (rest.limit !== undefined) payload.limit = rest.limit;
      if (rest.offset !== undefined) payload.offset = rest.offset;
      if (rest.startTime) payload.startTime = rest.startTime;
      if (rest.endTime) payload.endTime = rest.endTime;

      const response = await fetch(`${this.baseURL}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const parsed = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const message =
          (isRecord(parsed) &&
            (parsed.error || parsed.message || parsed.reason)) ||
          "Failed to get telemetry data";
        throw new Error(message);
      }

      let records: TelemetryRecord[] = [];

      if (Array.isArray(parsed)) {
        records = parsed as TelemetryRecord[];
      } else if (isRecord(parsed)) {
        if (Array.isArray(parsed.data)) {
          records = parsed.data as TelemetryRecord[];
        } else if (Array.isArray(parsed.telemetry)) {
          records = parsed.telemetry as TelemetryRecord[];
        }
      }

      if (
        records.length &&
        (rest.offset !== undefined || rest.limit !== undefined)
      ) {
        const start = rest.offset ?? 0;
        const end = rest.limit !== undefined ? start + rest.limit : undefined;
        records = records.slice(start, end);
      }

      return records;
    } catch (error) {
      console.error("Failed to get telemetry data:", error);
      throw error;
    }
  }

  /**
   * Get latest telemetry record
   */
  async getLatestTelemetry(): Promise<TelemetryRecord | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/xbee/telemetry`);
      const text = await response.text();
      const parsed = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const message =
          (isRecord(parsed) &&
            (parsed.error || parsed.message || parsed.reason)) ||
          "Failed to get latest telemetry";
        throw new Error(message);
      }

      if (Array.isArray(parsed)) {
        return parsed.length ? (parsed[0] as TelemetryRecord) : null;
      }

      if (isRecord(parsed)) {
        if (Array.isArray(parsed.data)) {
          return parsed.data.length
            ? (parsed.data[0] as TelemetryRecord)
            : null;
        }

        if (Array.isArray(parsed.telemetry)) {
          return parsed.telemetry.length
            ? (parsed.telemetry[0] as TelemetryRecord)
            : null;
        }

        if (parsed.data && !Array.isArray(parsed.data)) {
          return parsed.data as TelemetryRecord;
        }
      }

      return null;
    } catch (error) {
      console.error("Failed to get latest telemetry:", error);
      throw error;
    }
  }

  /**
   * Get telemetry statistics
   */
  async getTelemetryStatistics(): Promise<TelemetryStatistics> {
    try {
      const response = await fetch(`${this.baseURL}/api/xbee/telemetry/stats`);
      const result = await response.json();

      if (result.success) {
        return parseTelemetryStatistics(result.stats ?? result.data ?? {});
      }
      throw new Error(result.error || "Failed to get telemetry statistics");
    } catch (error) {
      console.error("Failed to get telemetry statistics:", error);
      throw error;
    }
  }

  // ============================================================================
  // HEALTH MONITORING
  // ============================================================================

  /**
   * Get connection health status
   */
  async getConnectionHealth(): Promise<ConnectionHealthStatus> {
    try {
      const response = await fetch(`${this.baseURL}/api/xbee/health`);
      const result = await response.json();

      if (result.success) {
        return (
          parseHealth(
            result.health ?? result.data ?? result.connection_health
          ) ?? {
            connected: false,
          }
        );
      }
      throw new Error(result.error || "Failed to get connection health");
    } catch (error) {
      console.error("Failed to get connection health:", error);
      throw error;
    }
  }

  // ============================================================================
  // WEBSOCKET REAL-TIME STREAMING
  // ============================================================================

  /**
   * Connect to WebSocket for real-time updates
   */
  connectWebSocket(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const wsURL = this.baseURL.replace("http", "ws") + "/api/xbee/ws";

    try {
      this.websocket = new WebSocket(wsURL);

      this.websocket.onopen = () => {
        console.log("WebSocket connected to XBee backend");
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.websocket.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        this.websocket = null;

        // Attempt to reconnect if it wasn't a manual disconnect
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          setTimeout(() => this.reconnectWebSocket(), this.reconnectDelay);
          this.reconnectAttempts++;
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
        }
      };

      this.websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close(1000, "Manual disconnect");
      this.websocket = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    const mappedType = mapWebSocketType(message.type);
    const handler = this.messageHandlers.get(mappedType);
    if (!handler) {
      return;
    }

    let payload: unknown = message.data;

    switch (mappedType) {
      case "status":
        payload = buildStatusResponse({
          connection:
            (message.data as any)?.connection ?? (message.data as any) ?? {},
          stats: (message.data as any)?.stats,
          mission: (message.data as any)?.mission,
          connection_health:
            (message.data as any)?.connection_health ??
            (message.data as any)?.connectionHealth,
        });
        this.setActiveMission((payload as XBeeStatus).mission);
        break;
      case "health":
        payload =
          parseHealth(
            (message.data as any)?.health ??
              (message.data as any)?.connection_health ??
              message.data
          ) ?? ({ connected: false } as ConnectionHealthStatus);
        break;
      case "mission":
        payload = parseMissionInfo(message.data) ?? null;
        this.setActiveMission(payload as MissionInfo | null);
        break;
      case "stats":
        payload =
          parseStats((message.data as any)?.stats ?? message.data) ?? null;
        break;
      case "activity":
        payload = (message.data as any)?.activity ?? message.data;
        break;
      default:
        payload = message.data;
    }

    handler(payload);
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private reconnectWebSocket(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(
        `Attempting to reconnect WebSocket (attempt ${
          this.reconnectAttempts + 1
        })`
      );
      this.connectWebSocket();
    } else {
      console.error("Max WebSocket reconnection attempts reached");
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Register handler for specific message types
   */
  onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Remove message handler
   */
  offMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Register handler for telemetry updates
   */
  onTelemetryUpdate(handler: (telemetry: TelemetryRecord) => void): void {
    this.onMessage("telemetry", handler);
  }

  /**
   * Register handler for status updates
   */
  onStatusUpdate(handler: (status: XBeeStatus) => void): void {
    this.onMessage("status", (status) => {
      this.setActiveMission((status as XBeeStatus).mission);
      handler(status as XBeeStatus);
    });
  }

  /**
   * Register handler for mission updates
   */
  onMissionUpdate(handler: (mission: MissionInfo | null) => void): void {
    this.onMessage("mission", (mission) => {
      this.setActiveMission(mission as MissionInfo | null);
      handler(mission as MissionInfo | null);
    });
  }

  /**
   * Register handler for health updates
   */
  onHealthUpdate(handler: (health: ConnectionHealthStatus) => void): void {
    this.onMessage("health", handler);
  }

  /**
   * Register handler for errors
   */
  onError(handler: (error: string) => void): void {
    this.onMessage("error", handler);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return (
      this.websocket !== null && this.websocket.readyState === WebSocket.OPEN
    );
  }

  /**
   * Get WebSocket connection state
   */
  getWebSocketState(): string {
    if (!this.websocket) return "DISCONNECTED";

    switch (this.websocket.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "OPEN";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "CLOSED";
      default:
        return "UNKNOWN";
    }
  }

  /**
   * Update base URL (useful for settings changes)
   */
  updateBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;

    // Reconnect WebSocket with new URL if currently connected
    if (this.isWebSocketConnected()) {
      this.disconnectWebSocket();
      this.connectWebSocket();
    }
  }

  // ============================================================================
  // AI/CHAT ENDPOINTS
  // ============================================================================

  /**
   * Send a chat message to the AI service
   */
  async sendChatMessage(message: string): Promise<{ content: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const result: ApiResponse<{ content: string }> = await response.json();

      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to send chat message");
    } catch (error) {
      console.error("Failed to send chat message:", error);
      throw error;
    }
  }

  // ============================================================================
  // MISSION MANAGEMENT (ADDITIONAL)
  // ============================================================================

  /**
   * Start a new mission with a custom name
   */
  async startMission(name: string): Promise<MissionInfo | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/xbee/mission/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to start mission");
      }

      const mission = parseMissionInfo(result.mission) ?? null;
      this.setActiveMission(mission ?? undefined);
      return mission;
    } catch (error) {
      console.error("Failed to start mission:", error);
      throw error;
    }
  }

  /**
   * Get current mission information
   */
  async getMissionInfo(): Promise<MissionInfo | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/xbee/mission`);
      const result: ApiResponse<MissionInfo> = await response.json();

      if (result.success) {
        const mission = result.data || null;
        this.setActiveMission(mission ?? undefined);
        return mission;
      }
      throw new Error(result.error || "Failed to get mission info");
    } catch (error) {
      console.error("Failed to get mission info:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const xbeeGoAPI = new XBeeGoAPIService();
export type {
  XBeeStatus,
  ConnectionHealthStatus,
  TelemetryStatistics,
  MissionInfo,
  TelemetryRecord,
  WebSocketMessage,
};
