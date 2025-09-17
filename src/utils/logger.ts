// Logging utilities for XBee communication

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private logLevel: LogLevel = LogLevel.INFO;

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  setMaxLogs(max: number) {
    this.maxLogs = max;
  }

  private addLog(
    level: LogLevel,
    category: string,
    message: string,
    data?: any
  ) {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      const levelName = LogLevel[level];
      const timestamp = entry.timestamp.toISOString();
      console.log(
        `[${timestamp}] ${levelName} [${category}] ${message}`,
        data || ""
      );
    }
  }

  debug(category: string, message: string, data?: any) {
    this.addLog(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.addLog(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.addLog(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.addLog(LogLevel.ERROR, category, message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level >= level);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return this.logs
      .map((log) => {
        const levelName = LogLevel[log.level];
        const timestamp = log.timestamp.toISOString();
        const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : "";
        return `[${timestamp}] ${levelName} [${log.category}] ${log.message}${dataStr}`;
      })
      .join("\n");
  }
}

export const logger = new Logger();

// Categories for different parts of the system
export const LOG_CATEGORIES = {
  CONNECTION: "CONNECTION",
  XBEE_TX: "XBEE_TX",
  XBEE_RX: "XBEE_RX",
  SERIAL: "SERIAL",
  ERROR: "ERROR",
  VALIDATION: "VALIDATION",
} as const;
