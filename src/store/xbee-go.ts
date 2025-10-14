/**
 * New XBee Store with Go Backend Integration
 * Replaces legacy Electron-based XBee communication with Go backend APIs
 */
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  xbeeGoAPI,
  type TelemetryRecord,
  type XBeeStatus,
  type ConnectionHealthStatus,
} from "../utils/xbee-go-api";
import { getMissionRequestFilename } from "../utils/mission-utils";
import type {
  ITelemetryType,
  ICommandType,
  ILogEntryType,
} from "../types/telemetry";

// ============================================================================
// TYPES
// ============================================================================

interface ActivityItem {
  timestamp: Date;
  type: "FRAME_RECEIVED" | "FRAME_SENT" | "CONNECTION" | "ERROR" | "MISSION";
  frameType?: string;
  details?: string;
}

interface FrameStats {
  telemetryCount: number;
  commandEchoCount: number;
  logEntryCount: number;
  unknownCount: number;
}

// Remove unused interface
// interface ConnectionStats {
//   packetsReceived: number;
//   packetsSent: number;
//   errorsCount: number;
// }

interface TelemetryState {
  history: ITelemetryType[];
  lastUpdate: Date | null;
  dataRate: number;
  missionStartTime: Date | null;
  totalMissionTime: number;
}

interface CommunicationState {
  commandEchoHistory: ICommandType[];
  logEntries: ILogEntryType[];
  rssi: {
    uplink: number | null;
    downlink: number | null;
    lastUpdate: Date | null;
  };
  rssiPolling: {
    isActive: boolean;
    interval: number;
    lastPollTime: Date | null;
    timerId: NodeJS.Timeout | null;
  };
}

interface ConnectionState {
  isConnected: boolean;
  selectedPort: string | null;
  connectionTime: Date | null;
  connectionHealth: ConnectionHealthStatus | null;
}

interface StatisticsState {
  packetsReceived: number;
  packetsSent: number;
  errorsCount: number;
  processingErrors: number;
  totalFramesProcessed: number;
  frameStats: FrameStats;
}

interface ActivityState {
  log: ActivityItem[];
}

interface MissionState {
  currentMission: any | null;
  missionHistory: any[];
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface XBeeGoStore {
  // State
  telemetry: TelemetryState;
  communication: CommunicationState;
  connection: ConnectionState;
  statistics: StatisticsState;
  activity: ActivityState;
  mission: MissionState;

  // Connection Actions
  updateConnectionStatus: () => Promise<void>;

  // Telemetry Actions
  updateTelemetry: (data: ITelemetryType) => void;
  clearTelemetry: () => void;
  getTelemetryByTimeRange: (startTime: Date, endTime: Date) => ITelemetryType[];
  loadTelemetryHistory: (options?: {
    limit?: number;
    offset?: number;
  }) => Promise<void>;

  // Communication Actions
  addCommandEcho: (command: ICommandType) => void;
  addLogEntry: (log: ILogEntryType) => void;
  clearCommandHistory: () => void;
  clearLogEntries: () => void;
  transmit: (data: string) => Promise<boolean>;
  startRSSIPolling: (interval: number) => void;
  stopRSSIPolling: () => void;

  // Mission Actions
  getCurrentMission: () => Promise<void>;
  endCurrentMission: () => Promise<boolean>;

  // Activity Actions
  addActivity: (
    type: ActivityItem["type"],
    frameType?: string,
    details?: string
  ) => void;
  clearActivityLog: () => void;

  // Statistics Actions
  incrementPacketsReceived: () => void;
  incrementPacketsSent: () => void;
  incrementErrorsCount: () => void;
  resetProcessingStats: () => void;

  // WebSocket Management
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  isWebSocketConnected: () => boolean;

  // Health Monitoring
  updateConnectionHealth: () => Promise<void>;

  // Utility
  prepareForMissionStart: () => void;
  resetStore: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const isNil = (value: unknown): boolean =>
  value === undefined || value === null || value === "";

const toNumber = (value: unknown): number | undefined => {
  if (isNil(value)) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toNumberOr = (value: unknown, fallback = 0): number =>
  toNumber(value) ?? fallback;

const toStringValue = (value: unknown): string | undefined => {
  if (isNil(value)) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
};

const toDateValue = (value: unknown): Date | undefined => {
  if (isNil(value)) {
    return undefined;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
};

const getRecordValue = (
  record: TelemetryRecord,
  ...keys: string[]
): unknown => {
  for (const key of keys) {
    const value = record[key];
    if (!isNil(value)) {
      return value;
    }
  }
  return undefined;
};

/**
 * Convert Go backend telemetry record to frontend format
 */
const convertTelemetryRecord = (record: TelemetryRecord): ITelemetryType => {
  const timestamp =
    toDateValue(getRecordValue(record, "timestamp", "created_at")) ||
    new Date();
  const missionTimeSeconds = Number.isFinite(timestamp.getTime())
    ? timestamp.getTime() / 1000
    : 0;

  const flightStateValue = toStringValue(
    getRecordValue(record, "state", "flight_state", "FLIGHT_STATE")
  ) as ITelemetryType["FLIGHT_STATE"];

  const telemetry: ITelemetryType = {
    TEAM_ID:
      toStringValue(getRecordValue(record, "TEAM_ID", "team_id", "teamId")) ||
      "1001",
    MISSION_TIME_S: missionTimeSeconds,
    PACKET_COUNT: toNumberOr(
      getRecordValue(record, "packet_number", "packetCount", "PACKET_COUNT")
    ),
    ALTITUDE: toNumberOr(getRecordValue(record, "altitude", "ALTITUDE")),
    PRESSURE: toNumberOr(getRecordValue(record, "pressure", "PRESSURE")),
    TEMPERATURE: toNumber(getRecordValue(record, "temperature", "TEMPERATURE")),
    VOLTAGE: toNumberOr(getRecordValue(record, "voltage", "VOLTAGE")),
    GNSS_TIME:
      toStringValue(getRecordValue(record, "gps_time", "GNSS_TIME")) ||
      timestamp.toISOString(),
    GNSS_LATITUDE: toNumberOr(
      getRecordValue(record, "gps_latitude", "latitude", "GNSS_LATITUDE"),
      0
    ),
    GNSS_LONGITUDE: toNumberOr(
      getRecordValue(record, "gps_longitude", "longitude", "GNSS_LONGITUDE"),
      0
    ),
    GNSS_ALTITUDE: toNumberOr(
      getRecordValue(record, "gps_altitude", "GNSS_ALTITUDE"),
      0
    ),
    GNSS_SATS: toNumberOr(
      getRecordValue(record, "gps_satellites", "satellites", "GNSS_SATS"),
      0
    ),
    ACCEL_X: toNumberOr(getRecordValue(record, "acceleration_x", "ACCEL_X"), 0),
    ACCEL_Y: toNumberOr(getRecordValue(record, "acceleration_y", "ACCEL_Y"), 0),
    ACCEL_Z: toNumberOr(getRecordValue(record, "acceleration_z", "ACCEL_Z"), 0),
    GYRO_SPIN_RATE: toNumberOr(
      getRecordValue(record, "gyro_spin_rate", "GYRO_SPIN_RATE"),
      0
    ),
    FLIGHT_STATE: flightStateValue,
    GYRO_X: toNumberOr(getRecordValue(record, "rotation_x", "GYRO_X"), 0),
    GYRO_Y: toNumberOr(getRecordValue(record, "rotation_y", "GYRO_Y"), 0),
    GYRO_Z: toNumberOr(getRecordValue(record, "rotation_z", "GYRO_Z"), 0),
    ROLL: toNumberOr(getRecordValue(record, "roll", "ROLL"), 0),
    PITCH: toNumberOr(getRecordValue(record, "pitch", "PITCH"), 0),
    YAW: toNumberOr(getRecordValue(record, "yaw", "YAW"), 0),
    MAG_X: toNumberOr(
      getRecordValue(record, "magnetometer_x", "MAG_X", "mag_x"),
      0
    ),
    MAG_Y: toNumberOr(
      getRecordValue(record, "magnetometer_y", "MAG_Y", "mag_y"),
      0
    ),
    MAG_Z: toNumberOr(
      getRecordValue(record, "magnetometer_z", "MAG_Z", "mag_z"),
      0
    ),
    HUMIDITY: toNumberOr(getRecordValue(record, "humidity", "HUMIDITY"), 0),
    CURRENT: toNumber(getRecordValue(record, "current", "CURRENT")),
    POWER: toNumber(getRecordValue(record, "power", "POWER")),
    BARO_ALTITUDE: toNumber(
      getRecordValue(record, "baro_altitude", "BARO_ALTITUDE")
    ),
    AIR_QUALITY_RAW: toNumber(
      getRecordValue(record, "air_quality_raw", "AIR_QUALITY_RAW")
    ),
    AIR_QUALITY_ETHANOL_PPM: toNumber(
      getRecordValue(record, "aq_ethanol_ppm", "AIR_QUALITY_ETHANOL_PPM")
    ),
    MCU_TEMP_C: toNumber(getRecordValue(record, "mcu_temp_c", "MCU_TEMP_C")),
    RSSI_DBM: toNumber(getRecordValue(record, "rssi_dbm", "RSSI_DBM")),
    HEALTH_FLAGS: toNumber(
      getRecordValue(record, "health_flags", "HEALTH_FLAGS")
    ),
    RTC_EPOCH: toNumber(getRecordValue(record, "rtc_epoch", "RTC_EPOCH")),
    RW_SPEED_PCT: toNumber(
      getRecordValue(record, "rw_speed_pct", "RW_SPEED_PCT")
    ),
    RW_SATURATED: toNumber(
      getRecordValue(record, "rw_saturated", "RW_SATURATED")
    ),
    YAW_RATE_TARGET: toNumber(
      getRecordValue(record, "yaw_rate_target", "YAW_RATE_TARGET")
    ),
    PID_OUTPUT: toNumber(getRecordValue(record, "pid_output", "PID_OUTPUT")),
    CMD_ECHO: toStringValue(
      getRecordValue(record, "cmd_echo", "command_echo", "CMD_ECHO")
    ),
  };

  // Derived/alias fields for backwards compatibility
  telemetry.timestamp = timestamp;
  telemetry.packetNumber = telemetry.PACKET_COUNT;
  telemetry.missionTime = missionTimeSeconds;
  telemetry.TEMP = telemetry.TEMPERATURE;
  telemetry.AQ_ETHANOL_PPM = telemetry.AIR_QUALITY_ETHANOL_PPM;
  telemetry.GYRO_SPIN = telemetry.GYRO_SPIN_RATE;
  telemetry.LATITUDE = telemetry.GNSS_LATITUDE;
  telemetry.LONGITUDE = telemetry.GNSS_LONGITUDE;
  telemetry.GPS_ALTITUDE = telemetry.GNSS_ALTITUDE;
  telemetry.SATELLITES = telemetry.GNSS_SATS;

  const flightSoftwareState = toNumber(
    getRecordValue(record, "flight_software_state", "FLIGHT_SOFTWARE_STATE")
  );
  if (flightSoftwareState !== undefined) {
    telemetry.FLIGHT_SOFTWARE_STATE = flightSoftwareState;
  }

  const airQualityPPM = toNumber(
    getRecordValue(record, "air_quality_ppm", "AIR_QUALITY_PPM", "voc_ppm")
  );
  if (airQualityPPM !== undefined) {
    telemetry.AIR_QUALITY_PPM = airQualityPPM;
    telemetry.VOC_PPM = airQualityPPM;
  }

  const signalQuality = toNumber(
    getRecordValue(record, "signal_quality_percent", "SIGNAL_QUALITY_PERCENT")
  );
  if (signalQuality !== undefined) {
    telemetry.SIGNAL_QUALITY_PERCENT = signalQuality;
  }

  const ramUsage = toNumber(
    getRecordValue(record, "ram_usage_percent", "RAM_USAGE_PERCENT")
  );
  if (ramUsage !== undefined) {
    telemetry.RAM_USAGE_PERCENT = ramUsage;
  }

  return telemetry;
};

const calculateDataRate = (
  history: ITelemetryType[],
  windowSize = 10
): number => {
  if (!history.length) {
    return 0;
  }

  const slice = history.slice(0, Math.min(history.length, windowSize));
  if (slice.length < 2) {
    return 0;
  }

  const newest = slice[0]?.timestamp;
  const oldest = slice[slice.length - 1]?.timestamp;

  if (!(newest instanceof Date) || !(oldest instanceof Date)) {
    return 0;
  }

  const durationSeconds = Math.abs(newest.getTime() - oldest.getTime()) / 1000;
  if (!Number.isFinite(durationSeconds) || durationSeconds === 0) {
    return 0;
  }

  const rate = slice.length / durationSeconds;
  return Number.isFinite(rate) ? Number(rate.toFixed(2)) : 0;
};

const calculateMissionDuration = (missionStartTime: Date): number => {
  if (!(missionStartTime instanceof Date)) {
    return 0;
  }

  const diffMs = Date.now() - missionStartTime.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 0;
  }

  return Math.floor(diffMs / 1000);
};

export const useXBeeGoStore = create<XBeeGoStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // ========================================================================
      // INITIAL STATE
      // ========================================================================

      telemetry: {
        history: [],
        lastUpdate: null,
        dataRate: 0,
        missionStartTime: null,
        totalMissionTime: 0,
      },

      communication: {
        commandEchoHistory: [],
        logEntries: [],
        rssi: {
          uplink: null,
          downlink: null,
          lastUpdate: null,
        },
        rssiPolling: {
          isActive: false,
          interval: 5000,
          lastPollTime: null,
          timerId: null,
        },
      },

      connection: {
        isConnected: false,
        selectedPort: null,
        connectionTime: null,
        connectionHealth: null,
      },

      statistics: {
        packetsReceived: 0,
        packetsSent: 0,
        errorsCount: 0,
        processingErrors: 0,
        totalFramesProcessed: 0,
        frameStats: {
          telemetryCount: 0,
          commandEchoCount: 0,
          logEntryCount: 0,
          unknownCount: 0,
        },
      },

      activity: {
        log: [],
      },

      mission: {
        currentMission: null,
        missionHistory: [],
      },

      // ========================================================================
      // CONNECTION ACTIONS
      // ========================================================================

      updateConnectionStatus: async () => {
        try {
          const status = await xbeeGoAPI.getStatus();
          set((state) => {
            state.connection.isConnected = status.connected;
            if (status.port) {
              state.connection.selectedPort = status.port;
            }
          });
        } catch (error) {
          console.error("Failed to update connection status:", error);
        }
      },

      // ========================================================================
      // TELEMETRY ACTIONS
      // ========================================================================

      updateTelemetry: (data: ITelemetryType) => {
        set((state) => {
          // Add to history (keep last 10000 records)
          state.telemetry.history.unshift(data);
          if (state.telemetry.history.length > 10000) {
            state.telemetry.history = state.telemetry.history.slice(0, 10000);
          }

          // Update metadata
          state.telemetry.lastUpdate = new Date();
          state.telemetry.dataRate = calculateDataRate(state.telemetry.history);

          // Set mission start time if first packet
          if (
            !state.telemetry.missionStartTime &&
            state.telemetry.history.length === 1
          ) {
            state.telemetry.missionStartTime = data.timestamp;
          }

          // Update mission duration
          if (state.telemetry.missionStartTime) {
            state.telemetry.totalMissionTime = calculateMissionDuration(
              state.telemetry.missionStartTime
            );
          }

          // Update statistics
          state.statistics.packetsReceived++;
          state.statistics.totalFramesProcessed++;
          state.statistics.frameStats.telemetryCount++;
        });

        get().addActivity(
          "FRAME_RECEIVED",
          "TELEMETRY",
          `Packet #${data.packetNumber}`
        );
      },

      clearTelemetry: () => {
        set((state) => {
          state.telemetry.history = [];
          state.telemetry.lastUpdate = null;
          state.telemetry.dataRate = 0;
          state.telemetry.missionStartTime = null;
          state.telemetry.totalMissionTime = 0;
        });
      },

      getTelemetryByTimeRange: (startTime: Date, endTime: Date) => {
        const state = get();
        return state.telemetry.history.filter(
          (data) => data.timestamp >= startTime && data.timestamp <= endTime
        );
      },

      loadTelemetryHistory: async (options = {}) => {
        try {
          const state = get();
          const missionFilename = getMissionRequestFilename(
            state.mission.currentMission?.dbPath,
            state.mission.currentMission?.name
          );

          const records = await xbeeGoAPI.getTelemetryData({
            filename: missionFilename,
            ...options,
          });
          const telemetryData = records.map(convertTelemetryRecord);

          set((state) => {
            if (options.offset === 0 || !options.offset) {
              // Replace history for fresh load
              state.telemetry.history = telemetryData;
            } else {
              // Append for pagination
              state.telemetry.history.push(...telemetryData);
            }

            if (telemetryData.length > 0) {
              state.telemetry.lastUpdate = new Date();
              state.telemetry.dataRate = calculateDataRate(
                state.telemetry.history
              );

              if (!state.telemetry.missionStartTime) {
                state.telemetry.missionStartTime =
                  telemetryData[telemetryData.length - 1].timestamp;
              }
            }
          });

          get().addActivity(
            "CONNECTION",
            undefined,
            `Loaded ${telemetryData.length} telemetry records`
          );
        } catch (error) {
          console.error("Failed to load telemetry history:", error);
          get().addActivity(
            "ERROR",
            undefined,
            "Failed to load telemetry history"
          );
        }
      },

      // ========================================================================
      // COMMUNICATION ACTIONS
      // ========================================================================

      addCommandEcho: (command: ICommandType) => {
        set((state) => {
          state.communication.commandEchoHistory.unshift(command);
          if (state.communication.commandEchoHistory.length > 1000) {
            state.communication.commandEchoHistory =
              state.communication.commandEchoHistory.slice(0, 1000);
          }
          state.statistics.frameStats.commandEchoCount++;
        });

        get().addActivity(
          "FRAME_RECEIVED",
          "COMMAND_ECHO",
          command.COMMAND_ECHO
        );
      },

      addLogEntry: (log: ILogEntryType) => {
        set((state) => {
          state.communication.logEntries.unshift(log);
          if (state.communication.logEntries.length > 1000) {
            state.communication.logEntries =
              state.communication.logEntries.slice(0, 1000);
          }
          state.statistics.frameStats.logEntryCount++;
        });

        get().addActivity("FRAME_RECEIVED", "LOG_ENTRY", log.MESSAGE);
      },

      clearCommandHistory: () => {
        set((state) => {
          state.communication.commandEchoHistory = [];
        });
      },

      clearLogEntries: () => {
        set((state) => {
          state.communication.logEntries = [];
        });
      },

      transmit: async (data: string) => {
        try {
          const result = await xbeeGoAPI.sendCommand(data);

          if (!result.success) {
            throw new Error(result.message || "Backend reported failure");
          }

          set((state) => {
            state.statistics.packetsSent++;
            if (result.mission) {
              state.mission.currentMission = result.mission;
            }
          });

          get().addActivity("FRAME_SENT", "COMMAND", data);
          return true;
        } catch (error) {
          console.error("Failed to transmit:", error);
          get().addActivity(
            "ERROR",
            undefined,
            `Transmission failed: ${error}`
          );
          return false;
        }
      },

      startRSSIPolling: (interval: number) => {
        const currentTimer = get().communication.rssiPolling.timerId;
        if (currentTimer) {
          clearInterval(currentTimer);
        }

        const pollRSSI = async () => {
          try {
            const success = await get().transmit("ATDB");
            if (success) {
              set((state) => {
                state.communication.rssiPolling.lastPollTime = new Date();
              });
            }
          } catch (error) {
            console.error("RSSI polling error:", error);
            get().addActivity(
              "ERROR",
              undefined,
              `RSSI poll failed: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        };

        set((state) => {
          state.communication.rssiPolling.isActive = true;
          state.communication.rssiPolling.interval = interval;
          state.communication.rssiPolling.lastPollTime = new Date();
          state.communication.rssiPolling.timerId = null;
        });

        pollRSSI();

        const timerId = setInterval(pollRSSI, interval);
        set((state) => {
          state.communication.rssiPolling.timerId = timerId;
        });

        get().addActivity(
          "CONNECTION",
          undefined,
          `Started RSSI polling every ${interval}ms`
        );
      },

      stopRSSIPolling: () => {
        const currentTimer = get().communication.rssiPolling.timerId;
        if (currentTimer) {
          clearInterval(currentTimer);
        }

        set((state) => {
          state.communication.rssiPolling.isActive = false;
          state.communication.rssiPolling.timerId = null;
        });

        get().addActivity("CONNECTION", undefined, "Stopped RSSI polling");
      },

      // ========================================================================
      // MISSION ACTIONS
      // ========================================================================

      getCurrentMission: async () => {
        try {
          const mission = await xbeeGoAPI.getCurrentMission();
          set((state) => {
            state.mission.currentMission = mission;
          });

          if (mission) {
            get().addActivity(
              "MISSION",
              undefined,
              `Active mission: ${mission.name}`
            );
          }
        } catch (error) {
          console.error("Failed to get current mission:", error);
        }
      },

      endCurrentMission: async () => {
        try {
          const success = await xbeeGoAPI.endMission();

          if (success) {
            set((state) => {
              state.mission.currentMission = null;
            });

            get().addActivity("MISSION", undefined, "Mission ended");
            return true;
          }

          return false;
        } catch (error) {
          console.error("Failed to end mission:", error);
          get().addActivity("ERROR", undefined, "Failed to end mission");
          return false;
        }
      },

      // ========================================================================
      // ACTIVITY ACTIONS
      // ========================================================================

      addActivity: (
        type: ActivityItem["type"],
        frameType?: string,
        details?: string
      ) => {
        set((state) => {
          const activity: ActivityItem = {
            timestamp: new Date(),
            type,
            frameType,
            details,
          };

          state.activity.log.unshift(activity);
          if (state.activity.log.length > 1000) {
            state.activity.log = state.activity.log.slice(0, 1000);
          }
        });
      },

      clearActivityLog: () => {
        set((state) => {
          state.activity.log = [];
        });
      },

      // ========================================================================
      // STATISTICS ACTIONS
      // ========================================================================

      incrementPacketsReceived: () => {
        set((state) => {
          state.statistics.packetsReceived++;
        });
      },

      incrementPacketsSent: () => {
        set((state) => {
          state.statistics.packetsSent++;
        });
      },

      incrementErrorsCount: () => {
        set((state) => {
          state.statistics.errorsCount++;
        });
      },

      resetProcessingStats: () => {
        set((state) => {
          state.statistics.processingErrors = 0;
          state.statistics.totalFramesProcessed = 0;
          state.statistics.frameStats = {
            telemetryCount: 0,
            commandEchoCount: 0,
            logEntryCount: 0,
            unknownCount: 0,
          };
        });
      },

      // ========================================================================
      // WEBSOCKET MANAGEMENT
      // ========================================================================

      connectWebSocket: () => {
        // Set up WebSocket message handlers
        xbeeGoAPI.onTelemetryUpdate((telemetry: TelemetryRecord) => {
          const converted = convertTelemetryRecord(telemetry);
          get().updateTelemetry(converted);
        });

        xbeeGoAPI.onStatusUpdate((status: XBeeStatus) => {
          set((state) => {
            state.connection.isConnected = status.connected;
            if (status.port) {
              state.connection.selectedPort = status.port;
            }
          });
        });

        xbeeGoAPI.onMissionUpdate((mission) => {
          set((state) => {
            state.mission.currentMission = mission;
          });
          get().addActivity(
            "MISSION",
            undefined,
            mission ? `Mission update: ${mission.name}` : "Mission cleared"
          );
        });

        xbeeGoAPI.onHealthUpdate((health: ConnectionHealthStatus) => {
          set((state) => {
            state.connection.connectionHealth = health;
          });

          if (!health.connected) {
            get().addActivity(
              "ERROR",
              undefined,
              `Connection lost: ${
                health.healthReason ||
                health.status ||
                health.healthStatus ||
                "Unknown reason"
              }`
            );
          }
        });

        xbeeGoAPI.onError((error: string) => {
          get().addActivity("ERROR", undefined, error);
          set((state) => {
            state.statistics.errorsCount++;
          });
        });

        // Connect the WebSocket
        xbeeGoAPI.connectWebSocket();
      },

      disconnectWebSocket: () => {
        xbeeGoAPI.disconnectWebSocket();
      },

      isWebSocketConnected: () => {
        return xbeeGoAPI.isWebSocketConnected();
      },

      // ========================================================================
      // HEALTH MONITORING
      // ========================================================================

      updateConnectionHealth: async () => {
        try {
          const health = await xbeeGoAPI.getConnectionHealth();
          set((state) => {
            state.connection.connectionHealth = health;
          });
        } catch (error) {
          console.error("Failed to update connection health:", error);
        }
      },

      // ========================================================================
      // UTILITY
      // ========================================================================

      prepareForMissionStart: () => {
        set((state) => {
          state.telemetry = {
            history: [],
            lastUpdate: null,
            dataRate: 0,
            missionStartTime: null,
            totalMissionTime: 0,
          };

          state.communication = {
            commandEchoHistory: [],
            logEntries: [],
            rssi: {
              uplink: null,
              downlink: null,
              lastUpdate: null,
            },
            rssiPolling: {
              isActive: false,
              interval: 5000,
              lastPollTime: null,
              timerId: null,
            },
          };

          state.statistics = {
            packetsReceived: 0,
            packetsSent: 0,
            errorsCount: 0,
            processingErrors: 0,
            totalFramesProcessed: 0,
            frameStats: {
              telemetryCount: 0,
              commandEchoCount: 0,
              logEntryCount: 0,
              unknownCount: 0,
            },
          };

          state.activity.log = [];

          if (state.mission.currentMission) {
            state.mission.missionHistory.unshift(state.mission.currentMission);
            state.mission.missionHistory = state.mission.missionHistory.slice(
              0,
              20
            );
          }
          state.mission.currentMission = null;
        });
      },

      resetStore: () => {
        set((state) => {
          // Reset all state to initial values
          state.telemetry = {
            history: [],
            lastUpdate: null,
            dataRate: 0,
            missionStartTime: null,
            totalMissionTime: 0,
          };

          state.communication = {
            commandEchoHistory: [],
            logEntries: [],
            rssi: {
              uplink: null,
              downlink: null,
              lastUpdate: null,
            },
            rssiPolling: {
              isActive: false,
              interval: 5000,
              lastPollTime: null,
              timerId: null,
            },
          };

          state.connection = {
            isConnected: false,
            selectedPort: null,
            connectionTime: null,
            connectionHealth: null,
          };

          state.statistics = {
            packetsReceived: 0,
            packetsSent: 0,
            errorsCount: 0,
            processingErrors: 0,
            totalFramesProcessed: 0,
            frameStats: {
              telemetryCount: 0,
              commandEchoCount: 0,
              logEntryCount: 0,
              unknownCount: 0,
            },
          };

          state.activity.log = [];
          state.mission = {
            currentMission: null,
            missionHistory: [],
          };
        });
      },
    }))
  )
);

// ============================================================================
// SELECTORS (for backward compatibility)
// ============================================================================

export const xbeeGoSelectors = {
  // Telemetry selectors
  latestTelemetry: (state: XBeeGoStore) => state.telemetry.history[0] || null,
  telemetryHistory: (state: XBeeGoStore) => state.telemetry.history,
  dataRate: (state: XBeeGoStore) => state.telemetry.dataRate,
  missionDuration: (state: XBeeGoStore) => state.telemetry.totalMissionTime,

  // Connection selectors
  isConnected: (state: XBeeGoStore) => state.connection.isConnected,
  selectedPort: (state: XBeeGoStore) => state.connection.selectedPort,
  connectionStats: (state: XBeeGoStore) => state.statistics,

  // Communication selectors
  lastCommandEcho: (state: XBeeGoStore) =>
    state.communication.commandEchoHistory[0] || null,
  commandEchoHistory: (state: XBeeGoStore) =>
    state.communication.commandEchoHistory,
  logEntries: (state: XBeeGoStore) => state.communication.logEntries,
  recentLogs: (state: XBeeGoStore) =>
    state.communication.logEntries.slice(0, 50),

  // RSSI selectors
  rssiUplink: (state: XBeeGoStore) => state.communication.rssi.uplink,
  rssiDownlink: (state: XBeeGoStore) => state.communication.rssi.downlink,
  rssiLastUpdate: (state: XBeeGoStore) => state.communication.rssi.lastUpdate,

  // Statistics selectors
  processingStats: (state: XBeeGoStore) => state.statistics,
  frameStats: (state: XBeeGoStore) => state.statistics.frameStats,

  // Activity selectors
  activityLog: (state: XBeeGoStore) => state.activity.log,
};
