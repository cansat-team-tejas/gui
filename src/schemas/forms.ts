/**
 * Form validation schemas using Zod
 */
import { z } from "zod";

// XBee Connection Form Schema
export const xbeeConnectionSchema = z.object({
  port: z.string().min(1, "Port is required"),
  baudRate: z
    .number()
    .min(1200, "Baud rate must be at least 1200")
    .max(115200, "Baud rate must be at most 115200"),
  teamId: z
    .string()
    .min(1, "Team ID is required")
    .max(4, "Team ID must be 4 characters or less"),
});

export type XBeeConnectionFormData = z.infer<typeof xbeeConnectionSchema>;

// Command Form Schema
export const commandFormSchema = z.object({
  command: z
    .string()
    .min(1, "Command is required")
    .max(50, "Command must be 50 characters or less"),
  teamId: z
    .string()
    .min(1, "Team ID is required")
    .max(4, "Team ID must be 4 characters or less"),
});

export type CommandFormData = z.infer<typeof commandFormSchema>;

// CSV Search Form Schema
export const csvSearchSchema = z.object({
  searchTerm: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  missionTimeStart: z.string().optional(),
  missionTimeEnd: z.string().optional(),
});

export type CsvSearchFormData = z.infer<typeof csvSearchSchema>;

// Export Configuration Schema
export const exportConfigSchema = z.object({
  format: z.enum(["csv", "json", "xlsx"], {
    message: "Please select an export format",
  }),
  filename: z.string().min(1, "Filename is required"),
  includeHeaders: z.boolean(),
  dateRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
});

export type ExportConfigFormData = z.infer<typeof exportConfigSchema>;

// Settings Form Schema
export const settingsFormSchema = z.object({
  teamId: z
    .string()
    .min(1, "Team ID is required")
    .max(4, "Team ID must be 4 characters or less"),
  autoConnect: z.boolean(),
  dataRetention: z
    .number()
    .min(100, "Data retention must be at least 100 packets")
    .max(10000, "Data retention must be at most 10000 packets"),
  logLevel: z.enum(["debug", "info", "warn", "error"]),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;
