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

// Port selection schema
export const portSelectionSchema = z.object({
  selectedPort: z.string().min(1, "Please select a port"),
});

// Export types
export type CustomCommandFormData = z.infer<typeof customCommandSchema>;
export type PortSelectionFormData = z.infer<typeof portSelectionSchema>;
