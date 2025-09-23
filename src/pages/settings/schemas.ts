/**
 * Settings page schemas using Zod
 */
import { z } from "zod";

// Custom command validation schema
export const customCommandSchema = z.object({
  command: z
    .string()
    .min(1, "Command cannot be empty")
    .max(50, "Command must be 50 characters or less")
    .regex(/^[A-Z0-9_:.,\-\s]+$/i, "Command contains invalid characters"),
});

// QNH validation schema
export const qnhSchema = z.object({
  qnh: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Invalid QNH value")
    .refine((val) => {
      const num = parseFloat(val);
      return num >= 900 && num <= 1100;
    }, "QNH must be between 900 and 1100 hPa"),
});

// Port selection schema
export const portSelectionSchema = z.object({
  selectedPort: z.string().min(1, "Please select a port"),
});

// Export types
export type CustomCommandFormData = z.infer<typeof customCommandSchema>;
export type QnhFormData = z.infer<typeof qnhSchema>;
export type PortSelectionFormData = z.infer<typeof portSelectionSchema>;
