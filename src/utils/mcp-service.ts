/**
 * MCP Service API Utilities
 * Functions to interact with the MCP AI service endpoints
 */

export interface MCPCreateDatabaseRequest {
  db_path: string; // e.g. "mission_001.db" (will be created under databases/)
}

export interface MCPCreateDatabaseResponse {
  message: string;
  db_path: string;
  full_path: string;
  now_active: boolean;
}

export interface MCPInsertDataRequest {
  TEAM_ID?: string;
  mission_time_s?: number;
  packet_count?: number;
  altitude?: number;
  pressure?: number;
  temperature?: number;
  voltage?: number;
  gnss_time?: string;
  latitude?: number;
  longitude?: number;
  gps_altitude?: number;
  satellites?: number;
  accel_x?: number;
  accel_y?: number;
  accel_z?: number;
  gyro_spin_rate?: number;
  flight_state?: number;
  gyro_x?: number;
  gyro_y?: number;
  gyro_z?: number;
  roll?: number;
  pitch?: number;
  yaw?: number;
  mag_x?: number;
  mag_y?: number;
  mag_z?: number;
  humidity?: number;
  current?: number;
  power?: number;
  baro_altitude?: number;
  air_quality_raw?: number;
  aq_ethanol_ppm?: number;
  mcu_temp_c?: number;
  rssi_dbm?: number;
  health_flags?: string;
  rtc_epoch?: number;
  cmd_echo?: string;
}

export interface MCPInsertDataResponse {
  message: string;
  id: number;
}

export interface MCPAskRequest {
  question: string;
}

export interface MCPAskResponse {
  answer: {
    content: string;
  };
  command?: string;
}

export class MCPService {
  private baseUrl: string;

  constructor(port: number = 8000) {
    this.baseUrl = `http://localhost:${port}`;
  }

  /**
   * Create a new SQLite database and set it as the active DB
   */
  async createDatabase(dbPath: string): Promise<MCPCreateDatabaseResponse> {
    const response = await fetch(`${this.baseUrl}/database/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        db_path: dbPath,
      } satisfies MCPCreateDatabaseRequest),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create database: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Push telemetry data to the active database
   */
  async pushTelemetry(
    data: MCPInsertDataRequest
  ): Promise<MCPInsertDataResponse> {
    const response = await fetch(`${this.baseUrl}/telemetry/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to insert data: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Ask a natural language question against the active database
   */
  async askQuestion(question: string): Promise<MCPAskResponse> {
    const response = await fetch(`${this.baseUrl}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question } satisfies MCPAskRequest),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to ask question: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get the current active database path
   */
  async getCurrentDatabase(): Promise<{ current_db_path: string | null }> {
    const response = await fetch(`${this.baseUrl}/database/current`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(
        `Failed to get current database: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Get all telemetry rows from the active database
   */
  async getTelemetry(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/telemetry`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch telemetry: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Execute a read-only SQL query against the active database
   */
  async query(sql: string): Promise<{ result: any[] }> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to execute query: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Chat via GET query parameter (alternative to /ask)
   */
  async chat(prompt: string): Promise<MCPAskResponse> {
    const url = new URL(`${this.baseUrl}/chat`);
    url.searchParams.set("prompt", prompt);
    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      throw new Error(
        `Failed to chat: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  // Generate a unique filename based on current timestamp
  static generateFilename(teamId: string = "TEJAS"): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5); // Remove milliseconds and colons
    return `mission_${teamId}_${timestamp}.db`;
  }
}

// Export convenience functions
export const createMCPService = (port: number) => new MCPService(port);

export const generateMissionFilename = (teamId?: string) =>
  MCPService.generateFilename(teamId);
