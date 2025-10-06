/**
 * MCP Service API Utilities
 * Functions to interact with the MCP AI service endpoints
 */

export interface MCPCreateDatabaseRequest {
  filename: string;
}

export interface MCPCreateDatabaseResponse {
  message: string;
}

export interface MCPInsertDataRequest {
  filename: string;
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
  filename: string;
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

  async createDatabase(filename: string): Promise<MCPCreateDatabaseResponse> {
    const response = await fetch(`${this.baseUrl}/create-db`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create database: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async insertTelemetryData(
    data: MCPInsertDataRequest
  ): Promise<MCPInsertDataResponse> {
    const response = await fetch(`${this.baseUrl}/insert-data`, {
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

  async askQuestion(
    question: string,
    filename: string
  ): Promise<MCPAskResponse> {
    const response = await fetch(`${this.baseUrl}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, filename }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to ask question: ${response.status} ${response.statusText}`
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
