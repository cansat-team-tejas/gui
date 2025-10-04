// Flight Software Log Symbol Mappings (matches firmware LOG_CONSTANTS)
export const LOG_SYMBOL_MEANINGS: Record<string, string> = {
  // System Events
  $: "Log Queue Initialized",
  "%": "Telemetry Queue Initialized",
  H: "System Startup",
  C: "System Reset",
  B: "System Ready",

  // Environment Sensor Events
  k: "Environment Sensor Failed",
  R: "Environment Sensor Success",

  // GPS Events
  G: "GPS Success",

  // IMU Events
  U: "IMU Failed",
  Q: "IMU Success",

  // Power System Events
  w: "Power System Failed",
  f: "Power System Success",

  // Air Quality Events
  e: "Air Quality Sensor Success",
  b: "Air Quality Warmed Up",
  d: "Air Quality Calibrated",

  // Parachute Events
  h: "Parachute Deployed",

  // Communication Events
  "2": "Command Received",
  "6": "XBee Reset",
  "4": "Send Failed",
  a: "Retry Attempt",
  V: "Max Retries Reached",

  // Command Events
  "7": "Reset Command",
  "9": "Calibrate Command",
  "!": "Emergency Command",
  l: "Start Command",
  n: "Shutdown Command",
  W: "Parachute Deploy Command",

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
  "8": "Flight State Recovered",

  // SD Card Events
  "@": "SD Card Init Success",
  "#": "SD Card Init Failed",
  "~": "SD Card Write Failed",
  p: "SD Card Reuse Directory",
  "1": "SD Card New Directory",

  // Telemetry Events
  "|": "Telemetry Started",
  "/": "Telemetry Stopped",

  // Calibration Events
  J: "IMU Calibration Start",
  "?": "Calibration Complete",

  // Other Events
  "&": "Log File Init Failed",
  ".": "Command Controller Initialized",

  // Mission Persistence System
  _: "System State Recovered",
  K: "System Fresh Start",
  "0": "System State Reset",
  "^": "State Recovered from EEPROM",
  g: "State Recovery Failed",
  z: "State Saved",
  "<": "State Critical Save",

  // RTC System Events
  F: "RTC Initialized",
  m: "RTC Time Set",
  x: "RTC GPS Sync",
  v: "RTC Time Invalid",
  E: "RTC Mission Start",

  // Air Quality Fallback
  ">": "Air Quality Fallback Calibration",

  // Reaction Wheel System
  L: "Reaction Wheel Init",
  i: "Reaction Wheel Arming",
  o: "Reaction Wheel Armed",
  r: "Reaction Wheel Disarmed",
  t: "Reaction Wheel Emergency Stop",
  s: "Reaction Wheel Enabled",
  "-": "Reaction Wheel Disabled",
  N: "Yaw Stabilizer Init",
  q: "Yaw Stabilizer Active",
  y: "Yaw Stabilizer Inactive",
};

// Category mappings for color coding
export const LOG_CATEGORIES = {
  SYSTEM: ["$", "%", "H", "B", "C", "K", "_", "0", ".", "&"],
  ENVIRONMENT: ["k", "R"],
  GPS: ["G"],
  IMU: ["U", "Q", "J"],
  POWER: ["w", "f"],
  AIR_QUALITY: ["e", "b", "d", ">"],
  PARACHUTE: ["h", "W"],
  COMMUNICATION: ["2", "6", "4", "a", "V"],
  COMMANDS: ["7", "9", "!", "l", "n"],
  FLIGHT_STATES: ["{", "}", "[", "]", "(", ")", "=", "+", "*", "8"],
  SD_CARD: ["@", "#", "~", "p", "1"],
  TELEMETRY: ["|", "/"],
  CALIBRATION: ["?"],
  MISSION_PERSISTENCE: ["^", "g", "z", "<"],
  RTC: ["F", "m", "x", "v", "E"],
  REACTION_WHEEL: ["L", "i", "o", "r", "t", "s", "-", "N", "q", "y"],
} as const;

// Get category for a log symbol
export const getLogCategory = (symbol: string): keyof typeof LOG_CATEGORIES => {
  for (const [category, symbols] of Object.entries(LOG_CATEGORIES)) {
    if ((symbols as readonly string[]).includes(symbol)) {
      return category as keyof typeof LOG_CATEGORIES;
    }
  }
  return "SYSTEM"; // Default fallback to SYSTEM instead of OTHER
};

// Parse log message format: "[timestamp symbol]" or "symbol:timestamp" or just raw message
export const parseLogMessage = (message: string) => {
  // Check if message contains multiple bracketed log entries
  const multipleEntries = message.match(/\[(\d+)\s+([!-~])\]/g);

  if (multipleEntries && multipleEntries.length > 1) {
    // Parse all entries and return them as a structured message
    const parsedEntries = multipleEntries
      .map((entry) => {
        const match = entry.match(/\[(\d+)\s+([!-~])\]/);
        if (match) {
          const timestamp = match[1];
          const symbol = match[2];
          const meaning = LOG_SYMBOL_MEANINGS[symbol];
          const category = getLogCategory(symbol);
          return {
            timestamp,
            symbol,
            meaning: meaning || `Unknown Symbol (${symbol})`,
            category,
          };
        }
        return null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    // Group entries by category for better organization
    const groupedEntries = parsedEntries.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<string, typeof parsedEntries>);

    // Create a clean summary
    const categorySummaries = Object.entries(groupedEntries)
      .map(([category, entries]) => {
        const categoryName = category.replace("_", " ");
        const entryList = entries
          .map((e) => `${e.meaning} (t:${e.timestamp})`)
          .join(", ");
        return `${categoryName}: ${entryList}`;
      })
      .join(" | ");

    return {
      isSystemLog: true,
      symbol: `${multipleEntries.length} Events`,
      timestamp: `${parsedEntries[0]?.timestamp}-${
        parsedEntries[parsedEntries.length - 1]?.timestamp
      }`,
      meaning: categorySummaries,
      category: "SYSTEM" as const,
      originalMessage: message,
      isMultiEntry: true,
      entries: parsedEntries,
    };
  }

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
      isMultiEntry: false,
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
      isMultiEntry: false,
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
    isMultiEntry: false,
  };
};

/**
 * Get user-friendly GUI display messages for log codes
 * Returns status messages with emojis for better visual feedback
 */
export const getLogDisplayMessage = (symbol: string): string => {
  const guiMessages: Record<string, string> = {
    // Air Quality Sensor Status
    u: "Air Quality: Warming up...",
    w: "Air Quality: Ready ✅",
    c: "Air Quality: Calibrated ✅",
    r: "Air Quality: Init Failed ❌",
    s: "Air Quality: Reading Error ⚠️",
    d: "Air Quality: Disconnected ❌",
    a: "Air Quality: Auto-calibrated 🔄",
    h: "Air Quality: High PPM ⚠️",
    x: "Air Quality: Cal Failed ❌",
    b: "Air Quality: Baseline Updated 🔄",
    f: "Air Quality: Fallback Cal 🔄",

    // System Status
    A: "System: Starting up...",
    D: "System: Ready ✅",
    B: "System: Error ❌",
    C: "System: Reset 🔄",

    // GPS Status
    I: "GPS: Success ✅",
    H: "GPS: Failed ❌",
    K: "GPS: Fix Acquired 📍",
    g: "GPS: Reset 🔄",

    // IMU Status
    M: "IMU: Success ✅",
    L: "IMU: Failed ❌",

    // Power Status
    P: "Power: Success ✅",
    O: "Power: Failed ❌",

    // Communication Status
    Z: "Comm: Success ✅",
    Y: "Comm: Failed ❌",
    z: "Comm: XBee Reset 🔄",
    y: "Comm: Send Failed ❌",
    t: "Comm: Timeout ⏱️",
    m: "Comm: Max Retries ❌",

    // SD Card Status
    "@": "SD Card: Init Success ✅",
    "#": "SD Card: Init Failed ❌",
    "^": "SD Card: Write Success 💾",
    "~": "SD Card: Write Failed ❌",

    // Telemetry Status
    "|": "Telemetry: Started 📡",
    "/": "Telemetry: Stopped ⏹️",

    // Parachute Status
    T: "Parachute: Deployed 🪂",
    U: "Parachute: Failed ❌",
    V: "Parachute: Armed ⚠️",

    // Flight States
    "{": "Flight: Boot 🔄",
    "}": "Flight: Test Mode 🧪",
    "[": "Flight: Launch Pad 🚀",
    "]": "Flight: Ascent 📈",
    "(": "Flight: Rocket Deploy 🚀",
    ")": "Flight: Descent 📉",
    "=": "Flight: Secondary Deploy 🪂",
    "+": "Flight: Final Descent 📉",
    "*": "Flight: Impact 💥",

    // Calibration
    "?": "Calibration: Complete ✅",
    ":": "Calibrating: Gyro 🔄",
    ";": "Calibrating: Baro 🔄",
    "<": "Calibrating: Accel 🔄",
    ">": "Calibrating: Mag 🔄",
    i: "Calibrating: IMU Start 🔄",
  };

  return (
    guiMessages[symbol] || LOG_SYMBOL_MEANINGS[symbol] || `Unknown (${symbol})`
  );
};
