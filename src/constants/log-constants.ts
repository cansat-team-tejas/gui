// Flight Software Log Symbol Mappings
export const LOG_SYMBOL_MEANINGS: Record<string, string> = {
  // System Events
  $: "Log Queue Initialized",
  "%": "Telemetry Queue Initialized",
  A: "System Startup",
  B: "System Error",
  C: "System Reset",
  D: "System Ready",

  // Environment Sensor Events
  E: "Environment Sensor Failed",
  F: "Environment Sensor Success",
  G: "Environment Data",

  // GPS Events
  H: "GPS Failed",
  I: "GPS Success",
  J: "GPS Data",
  K: "GPS Fix Acquired",

  // IMU Events
  L: "IMU Failed",
  M: "IMU Success",
  N: "IMU Data",

  // Power System Events
  O: "Power System Failed",
  P: "Power System Success",
  Q: "Power Data",

  // Air Quality Events
  R: "Air Quality Sensor Success",
  S: "Air Quality Data",

  // Parachute Events
  T: "Parachute Deployed",
  U: "Parachute Failed",
  V: "Parachute Armed",

  // Communication Events
  W: "Serial Failed",
  X: "Serial Success",
  Y: "Communication Failed",
  Z: "Communication Success",
  "1": "Communication No Response",
  "2": "Command Received",

  // Data Management Events
  "3": "Data Overflow",
  "4": "Data Saved",
  "5": "Data Cleared",

  // Command Events
  "6": "Reset Command",
  "7": "Rate Change Command",
  "8": "Calibrate Command",
  "9": "Emergency Command",
  "!": "Start Command",
  "0": "Shutdown Command",

  // Flight State Events
  "{": "Boot State",
  "}": "Test Mode",
  "[": "Launch Pad",
  "]": "Ascent",
  "(": "Rocket Deploy",
  ")": "Descent",
  "=": "Secondary Deploy",
  "+": "Final Descent",
  "*": "Impact",

  // SD Card Events
  "@": "SD Card Init Success",
  "#": "SD Card Init Failed",
  "^": "SD Card Write Success",
  "~": "SD Card Write Failed",

  // Telemetry Events
  "|": "Telemetry Started",
  "/": "Telemetry Stopped",

  // Calibration Events
  ":": "Gyro Calibration",
  ";": "Barometer Calibration",
  "<": "Accelerometer Calibration",
  ">": "Magnetometer Calibration",
  "?": "Calibration Complete",

  // Other Events
  "&": "Log File Init Failed",
  ".": "Command Controller Initialized",
  ",": "Reaction Wheel Initialized",
};

// Category mappings for color coding
export const LOG_CATEGORIES = {
  SYSTEM: ["$", "%", "A", "B", "C", "D"],
  ENVIRONMENT: ["E", "F", "G"],
  GPS: ["H", "I", "J", "K"],
  IMU: ["L", "M", "N"],
  POWER: ["O", "P", "Q"],
  AIR_QUALITY: ["R", "S"],
  PARACHUTE: ["T", "U", "V"],
  COMMUNICATION: ["W", "X", "Y", "Z", "1", "2"],
  DATA: ["3", "4", "5"],
  COMMANDS: ["6", "7", "8", "9", "!", "0"],
  FLIGHT_STATES: ["{", "}", "[", "]", "(", ")", "=", "+", "*"],
  SD_CARD: ["@", "#", "^", "~"],
  TELEMETRY: ["|", "/"],
  CALIBRATION: [":", ";", "<", ">", "?"],
  OTHER: ["&", ".", ","],
};

// Get category for a log symbol
export const getLogCategory = (symbol: string): keyof typeof LOG_CATEGORIES => {
  for (const [category, symbols] of Object.entries(LOG_CATEGORIES)) {
    if (symbols.includes(symbol)) {
      return category as keyof typeof LOG_CATEGORIES;
    }
  }
  return "OTHER";
};

// Parse log message format: "[timestamp symbol]" or "symbol:timestamp" or just raw message
export const parseLogMessage = (message: string) => {
  // Check if message follows pattern: [timestamp symbol] - like [202135 /] or [202135 2]
  const bracketMatch = message.match(/^\[(\d+)\s+([!-~])\]$/);

  if (bracketMatch) {
    const timestamp = bracketMatch[1];
    const symbol = bracketMatch[2];
    const meaning = LOG_SYMBOL_MEANINGS[symbol];

    return {
      isSystemLog: true,
      symbol,
      timestamp,
      meaning: meaning || `Unknown (${symbol})`,
      category: getLogCategory(symbol),
      originalMessage: message,
    };
  }

  // Check if message follows pattern: single character followed by colon and number
  const colonMatch = message.match(/^([!-~]):(\d+)$/);

  if (colonMatch) {
    const symbol = colonMatch[1];
    const timestamp = colonMatch[2];
    const meaning = LOG_SYMBOL_MEANINGS[symbol];

    return {
      isSystemLog: true,
      symbol,
      timestamp,
      meaning: meaning || `Unknown (${symbol})`,
      category: getLogCategory(symbol),
      originalMessage: message,
    };
  }

  // If not a system log, return as regular message
  return {
    isSystemLog: false,
    symbol: null,
    timestamp: null,
    meaning: message,
    category: "OTHER" as const,
    originalMessage: message,
  };
};
