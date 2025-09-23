import type { CommandEcho } from "../validation/frames";

export class CommandParser {
  private static readonly CMD_ECHO_PATTERN = /CMD_ECHO:([^:]+):(.+)/;

  static parseCommandEcho(data: string): CommandEcho {
    const match = data.match(this.CMD_ECHO_PATTERN);
    if (!match) {
      return { command: "UNKNOWN", response: data };
    }

    const [, command, response] = match;
    const parameters: Record<string, string> = {};

    // Parse structured responses (e.g., "OK,TIME:50234")
    if (response.includes(":") || response.includes(",")) {
      const parts = response.split(",");
      for (const part of parts) {
        if (part.includes(":")) {
          const [key, value] = part.split(":");
          parameters[key.trim()] = value.trim();
        }
      }
    }

    return {
      command: command.trim(),
      response: response.trim(),
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
    };
  }
}
