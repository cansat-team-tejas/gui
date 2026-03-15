import { useEffect, useRef, useState } from "react";
import { useSimulationStore } from "../store/simulation";
import { useXBeeStore } from "../store/xbee";
import { createMCPService } from "../utils/mcp-service";
import { generateSimFrame, resetSimPrevState } from "../utils/simulation-engine";
import type { ITelemetryType } from "../types/telemetry";

const TICK_MS = 100; // 10 Hz — matches firmware telemetry rate

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const mapBackendRowToTelemetry = (row: Record<string, unknown>): ITelemetryType => ({
  TEAM_ID: toStringValue(row.TEAM_ID),
  MISSION_TIME_S: toNumber(row.mission_time_s),
  PACKET_COUNT: toNumber(row.packet_count),
  ALTITUDE: toNumber(row.altitude),
  PRESSURE: toNumber(row.pressure),
  TEMPERATURE: toNumber(row.temperature),
  VOLTAGE: toNumber(row.voltage),
  GNSS_TIME: toStringValue(row.gnss_time),
  LATITUDE: toNumber(row.latitude),
  LONGITUDE: toNumber(row.longitude),
  GPS_ALTITUDE: toNumber(row.gps_altitude),
  SATELLITES: toNumber(row.satellites),
  ACCEL_X: toNumber(row.accel_x),
  ACCEL_Y: toNumber(row.accel_y),
  ACCEL_Z: toNumber(row.accel_z),
  GYRO_SPIN_RATE: toNumber(row.gyro_spin_rate),
  FLIGHT_STATE: toNumber(row.flight_state),
  GYRO_X: toNumber(row.gyro_x),
  GYRO_Y: toNumber(row.gyro_y),
  GYRO_Z: toNumber(row.gyro_z),
  ROLL: toNumber(row.roll),
  PITCH: toNumber(row.pitch),
  YAW: toNumber(row.yaw),
  MAG_X: toNumber(row.mag_x),
  MAG_Y: toNumber(row.mag_y),
  MAG_Z: toNumber(row.mag_z),
  HUMIDITY: toNumber(row.humidity),
  CURRENT: toNumber(row.current),
  POWER: toNumber(row.power),
  BARO_ALTITUDE: toNumber(row.baro_altitude),
  MCU_TEMP_C: toNumber(row.mcu_temp_c),
  RSSI_DBM: toNumber(row.rssi_dbm),
  RTC_EPOCH: toNumber(row.rtc_epoch),
  CMD_ECHO: toStringValue(row.cmd_echo),
  LOG_DATA: toStringValue(row.log_data),
});

export const useSimulation = () => {
  const mode = useSimulationStore((s) => s.mode);
  const isRunning = useSimulationStore((s) => s.isRunning);
  const setElapsed = useSimulationStore((s) => s.setElapsed);
  const [backendFrames, setBackendFrames] = useState<ITelemetryType[] | null>(null);

  const elapsedRef = useRef(0);
  const packetRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBackendFrames = async () => {
      try {
        const rows = await createMCPService().getTelemetry();
        if (cancelled || !Array.isArray(rows) || rows.length === 0) {
          return;
        }

        const frames = rows
          .map((row) => mapBackendRowToTelemetry(row as Record<string, unknown>))
          .sort((left, right) => left.PACKET_COUNT - right.PACKET_COUNT);

        if (frames.length > 0) {
          setBackendFrames(frames);
        }
      } catch {
        // Backend dataset is optional for local development; fallback remains local generation.
      }
    };

    loadBackendFrames();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const shouldRun = mode === "gui" && isRunning;

    if (!shouldRun) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Reset counters on each start
    elapsedRef.current = 0;
    packetRef.current = 0;
    resetSimPrevState();

    const frames = backendFrames && backendFrames.length > 0 ? backendFrames : null;
    let frameIndex = 0;

    intervalRef.current = setInterval(() => {
      let frame: ITelemetryType;

      if (frames) {
        frame = frames[frameIndex % frames.length];
        frameIndex += 1;
        elapsedRef.current = frame.MISSION_TIME_S;
        packetRef.current = frame.PACKET_COUNT;
      } else {
        elapsedRef.current += TICK_MS / 1000;
        packetRef.current += 1;
        frame = generateSimFrame(elapsedRef.current, packetRef.current);
      }

      useXBeeStore.getState().updateTelemetry(frame);

      // Throttle store writes for elapsed (every 10 ticks = 1s)
      if (packetRef.current % 10 === 0 || frames) {
        setElapsed(frame.MISSION_TIME_S);
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [backendFrames, mode, isRunning, setElapsed]);
};
