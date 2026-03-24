export interface MCPCreateDatabaseRequest {
  db_path: string;
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
  current_row?: Record<string, unknown>;
}

export interface MCPAskResponse {
  answer: {
    content: string;
  };
  command?: string;
  sql?: string;
  details?: {
    row_count: number;
    [key: string]: any;
  };
}

export interface MCPCurrentDatabaseResponse {
  current_db_path: string | null;
  read_only?: boolean;
}

export class MCPService {
  private baseUrl: string;

  constructor(urlOrPort?: string | number) {
    const envUrl = import.meta.env.VITE_API_URL as string | undefined;
    const finalVal = urlOrPort ?? envUrl ?? 8000;

    if (typeof finalVal === "number") {
      this.baseUrl = `http://localhost:${finalVal}`;
    } else if (!isNaN(Number(finalVal)) && finalVal.trim() !== "") {
      this.baseUrl = `http://localhost:${finalVal}`;
    } else {
      this.baseUrl = finalVal;
    }
  }

  async createDatabase(dbPath: string): Promise<MCPCreateDatabaseResponse> {
    const response = await fetch(`${this.baseUrl}/database/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db_path: dbPath } satisfies MCPCreateDatabaseRequest),
    });

    if (!response.ok) {
      throw new Error(`Failed to create database: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async pushTelemetry(data: MCPInsertDataRequest): Promise<MCPInsertDataResponse> {
    const response = await fetch(`${this.baseUrl}/telemetry/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to insert data: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async askQuestion(
    question: string,
    currentRow?: Record<string, unknown>
  ): Promise<MCPAskResponse> {
    const response = await fetch(`${this.baseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        ...(currentRow ? { current_row: currentRow } : {}),
      } satisfies MCPAskRequest),
    });

    if (!response.ok) {
      throw new Error(`Failed to ask question: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getCurrentDatabase(): Promise<MCPCurrentDatabaseResponse> {
    const response = await fetch(`${this.baseUrl}/database/current`);
    if (!response.ok) {
      throw new Error(`Failed to get current database: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getTelemetry(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/telemetry`);
    if (!response.ok) {
      throw new Error(`Failed to fetch telemetry: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async query(sql: string): Promise<{ result: any[] }> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    });
    if (!response.ok) {
      throw new Error(`Failed to execute query: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  static generateFilename(teamId: string = "TEJAS"): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return `mission_${teamId}_${timestamp}.db`;
  }
}

export const createMCPService = (urlOrPort?: string | number) =>
  new MCPService(urlOrPort);

export const generateMissionFilename = (teamId?: string) =>
  MCPService.generateFilename(teamId);
