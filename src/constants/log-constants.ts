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

  // Extended firmware log symbols (lowercase)

  // Air Quality Sensor Status
  a: "Air quality auto-calibration performed",
  b: "Air quality baseline resistance updated",
  c: "Air quality sensor calibrated successfully",
  d: "Air quality sensor appears disconnected",
  h: "High gas concentration detected",
  r: "Air quality sensor failed to initialize",
  s: "Air quality sensor reading error",
  u: "Air quality warmup period started",
  w: "Air quality warmed up (3 minute warmup complete)",
  x: "Air quality calibration failed",

  // BME280 Environmental Sensor
  f: "BME280 I2C active at address 0x77",
  g: "BME280 I2C active at address 0x76",
  k: "BME280 starting diagnostics",
  l: "BME280 device found at address 0x76",
  m: "BME280 device found at address 0x77",
  n: "BME280 working/responding at 0x76",
  o: "BME280 working/responding at 0x77",
  p: "BME280 no I2C communication",

  // Other System Events
  e: "Emergency mode activated",
  i: "IMU calibration warning",
  j: "Jump detection algorithm",
  q: "Queue full warning",
  t: "Temperature out of range",
  v: "Voltage regulator warning",
  y: "Year rollover event",
  z: "Zero crossing detected",
};

// Category mappings for color coding
export const LOG_CATEGORIES = {
  SYSTEM: ["$", "%", "A", "B", "C", "D", "e", "j", "q", "y", "z"],
  ENVIRONMENT: ["E", "F", "G", "f", "g", "k", "l", "m", "n", "o", "p", "t"],
  GPS: ["H", "I", "J", "K"],
  IMU: ["L", "M", "N", "i"],
  POWER: ["O", "P", "Q", "v"],
  AIR_QUALITY: ["R", "S", "a", "b", "c", "d", "h", "r", "s", "u", "w", "x"],
  PARACHUTE: ["T", "U", "V"],
  COMMUNICATION: ["W", "X", "Y", "Z", "1", "2", "c", "n", "x"],
  DATA: ["3", "4", "5", "d", "o", "q"],
  COMMANDS: ["6", "7", "8", "9", "!", "0"],
  FLIGHT_STATES: ["{", "}", "[", "]", "(", ")", "=", "+", "*", "j", "z"],
  SD_CARD: ["@", "#", "^", "~", "f"],
  TELEMETRY: ["|", "/"],
  CALIBRATION: [":", ";", "<", ">", "?"],
  ERRORS: ["e", "w", "y"],
  OTHER: ["&", ".", ",", "u"],
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

    // BME280 Environmental Sensor
    g: "BME280: I2C Ready (0x76) ✅",
    f: "BME280: I2C Ready (0x77) ✅",
    E: "BME280: Init Failed ❌",
    k: "BME280: Running Diagnostics...",
    l: "BME280: Found at 0x76",
    m: "BME280: Found at 0x77",
    n: "BME280: Responding (0x76) ✅",
    o: "BME280: Responding (0x77) ✅",
    p: "BME280: No I2C Communication ❌",
  };

  return (
    guiMessages[symbol] || LOG_SYMBOL_MEANINGS[symbol] || `Unknown (${symbol})`
  );
};
