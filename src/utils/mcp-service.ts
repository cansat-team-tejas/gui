/**
 * MCP Service API Utilities
 * Modernized to match the updated Go backend REST contract (README.md)
 */

import { BACKEND_CONFIG } from "../constants";
import {
  getMissionRequestFilename,
  getMissionNameFromFilename,
} from "./mission-utils";

export interface MCPMissionInfo {
  id: string;
  name: string;
  startTime: string;
  isActive?: boolean;
  dbPath?: string | null;
  endTime?: string | null;
}

export interface MCPCreateDatabaseResponse {
  message: string;
  mission?: MCPMissionInfo | null;
}

export interface MCPInsertDataResponse {
  message: string;
  id: number;
  deprecated?: boolean;
}

export interface MCPAskResponse {
  answer: {
    content: string;
  };
  command?: string;
  raw?: unknown;
}

type MCPChatMessageRole = "user" | "assistant" | "system";

interface MCPChatMessage {
  role: MCPChatMessageRole;
  content: string;
}

interface MCPError extends Error {
  status?: number;
  data?: unknown;
}

const isRecord = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === "object";

const normalizeBaseURL = (base: number | string | undefined): string => {
  if (typeof base === "number") {
    return `http://localhost:${base}`;
  }

  if (!base || base.trim().length === 0) {
    return BACKEND_CONFIG.BACKEND_URL;
  }

  const trimmed = base.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  return `http://${trimmed.replace(/\/$/, "")}`;
};

export class MCPService {
  private baseUrl: string;

  constructor(base: number | string = BACKEND_CONFIG.BACKEND_URL) {
    this.baseUrl = normalizeBaseURL(base);
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private async fetchJson<T>(
    path: string,
    init: RequestInit
  ): Promise<{ data: T; raw: unknown; response: Response }> {
    const url = this.buildUrl(path);
    const response = await fetch(url, init);
    const text = await response.text();

    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        const parseError = new Error(
          `Failed to parse response from ${url}: ${(error as Error).message}`
        ) as MCPError;
        parseError.status = response.status;
        throw parseError;
      }
    }

    if (!response.ok) {
      const error = new Error(
        (isRecord(parsed) &&
          (parsed.error || parsed.message || parsed.reason)) ||
          `Request to ${url} failed (${response.status} ${response.statusText})`
      ) as MCPError;
      error.status = response.status;
      error.data = parsed;
      throw error;
    }

    if (isRecord(parsed) && "success" in parsed && parsed.success === false) {
      const error = new Error(
        (parsed.error || parsed.message || "Request failed") as string
      ) as MCPError;
      error.status = response.status;
      error.data = parsed;
      throw error;
    }

    return {
      data: parsed as T,
      raw: parsed,
      response,
    };
  }

  private async startMissionRequest(
    name: string
  ): Promise<MCPMissionInfo | null> {
    const payload = {
      name,
    };

    const { data } = await this.fetchJson<{
      success?: boolean;
      mission?: MCPMissionInfo | null;
    }>("/api/xbee/mission/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (isRecord(data) && "mission" in data) {
      return (data.mission as MCPMissionInfo | null) ?? null;
    }

    return null;
  }

  private async legacyCreateDatabase(
    filename: string
  ): Promise<MCPCreateDatabaseResponse> {
    const { data } = await this.fetchJson<MCPCreateDatabaseResponse>(
      "/create-db",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      }
    );

    return data;
  }

  async createDatabase(filename: string): Promise<MCPCreateDatabaseResponse> {
    const requestFilename =
      getMissionRequestFilename(filename) ?? filename ?? "";
    const missionName =
      getMissionNameFromFilename(requestFilename) ??
      requestFilename.replace(/\.db$/i, "");

    try {
      const mission = await this.startMissionRequest(missionName);
      return {
        message: mission
          ? `Mission ${mission.name} started`
          : "Mission start requested",
        mission,
      };
    } catch (error) {
      const status = (error as MCPError).status;
      if (status === 404 || status === 405) {
        return this.legacyCreateDatabase(requestFilename);
      }

      throw error;
    }
  }

  async insertTelemetryData(): Promise<MCPInsertDataResponse> {
    return {
      message:
        "Telemetry ingestion is handled automatically by the Go backend.",
      id: -1,
      deprecated: true,
    };
  }

  private async askUsingChatEndpoint(
    question: string,
    filename?: string
  ): Promise<MCPAskResponse> {
    const messages: MCPChatMessage[] = [
      {
        role: "user",
        content: question,
      },
    ];

    const payload: Record<string, unknown> = {
      messages,
      stream: false,
    };

    if (filename) {
      payload.filename = filename;
    }

    const { data, raw } = await this.fetchJson<Record<string, unknown>>(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const content =
      (isRecord(data) &&
        (data.message ||
          data.content ||
          (isRecord(data.data) && (data.data.content || data.data.message)) ||
          (isRecord(data.answer) && data.answer.content))) ||
      "";

    const command =
      (isRecord(data) &&
        (data.command ||
          (isRecord(data.data) && data.data.command) ||
          (isRecord(data.answer) && data.answer.command))) ||
      undefined;

    return {
      answer: {
        content: String(content),
      },
      command: command ? String(command) : undefined,
      raw,
    };
  }

  private async askUsingAskEndpoint(
    question: string,
    filename?: string
  ): Promise<MCPAskResponse> {
    const bodyPayload: Record<string, unknown> = { question };
    if (filename) {
      bodyPayload.filename = filename;
    }

    const { data } = await this.fetchJson<MCPAskResponse>("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    return data;
  }

  async askQuestion(
    question: string,
    filename?: string
  ): Promise<MCPAskResponse> {
    const requestFilename = getMissionRequestFilename(filename);

    try {
      return await this.askUsingAskEndpoint(question, requestFilename);
    } catch (error) {
      const status = (error as MCPError).status;
      if (status && status !== 404 && status !== 405) {
        throw error;
      }

      return this.askUsingChatEndpoint(question, requestFilename);
    }
  }

  // Generate a unique mission identifier (used as default mission name)
  static generateFilename(teamId: string = "TEJAS"): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return `mission_${teamId}_${timestamp}.db`;
  }
}

export const createMCPService = (base?: number | string) =>
  new MCPService(base ?? BACKEND_CONFIG.BACKEND_URL);

export const generateMissionFilename = (teamId?: string) =>
  MCPService.generateFilename(teamId);
