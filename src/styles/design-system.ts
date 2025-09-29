/**
 * Design System Tokens
 * Consistent design tokens for the CanSat Ground Station GUI
 */

export const designTokens = {
  // Colors
  colors: {
    // Primary colors
    primary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },

    // Status colors
    success: {
      50: "#f0fdf4",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
    },

    warning: {
      50: "#fffbeb",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
    },

    danger: {
      50: "#fef2f2",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
    },

    info: {
      50: "#f0f9ff",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
    },

    // GUI specific colors
    background: "#ffffff",
    panel: "#D9D9D9",
    border: "#000000",
    text: {
      primary: "#000000",
      secondary: "#6b7280",
      muted: "#9ca3af",
    },
  },

  // Typography
  typography: {
    fontFamily: {
      mono: ["Monaco", "Menlo", "Ubuntu Mono", "monospace"],
    },
    fontSize: {
      xs: "9px",
      sm: "10px",
      base: "12px",
      lg: "13px",
      xl: "14px",
    },
    fontWeight: {
      normal: "400",
      bold: "700",
    },
    lineHeight: {
      tight: "1.2",
      normal: "1.4",
    },
  },

  // Spacing
  spacing: {
    px: "1px",
    0.5: "2px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
  },

  // Component specific
  components: {
    button: {
      height: {
        sm: "20px",
        base: "25px",
        lg: "30px",
      },
      padding: {
        x: "8px",
        y: "4px",
      },
    },

    panel: {
      padding: "8px",
      headerPadding: "4px 8px",
      borderWidth: "1px",
    },

    input: {
      height: "25px",
      padding: "4px 8px",
      borderWidth: "1px",
    },
  },

  // Layout
  layout: {
    containerWidth: "400px",
    sectionSpacing: "12px",
    itemSpacing: "8px",
  },

  // Animation
  animation: {
    duration: {
      fast: "150ms",
      normal: "250ms",
      slow: "350ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
};

// CSS custom properties generator
export const generateCSSVariables = (tokens: typeof designTokens) => {
  const flattenObject = (obj: any, prefix = ""): Record<string, string> => {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}-${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(acc, flattenObject(value, newKey));
      } else {
        acc[`--${newKey}`] = Array.isArray(value)
          ? value.join(", ")
          : String(value);
      }

      return acc;
    }, {} as Record<string, string>);
  };

  return flattenObject(tokens);
};
