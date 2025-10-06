/**
 * MCP Integration Hook
 * Handles automatic telemetry data insertion to MCP database
 */
import { useEffect, useRef } from "react";
import { useXBeeStore } from "../store/xbee";
import { useSettingsState } from "../pages/settings/hooks";
import { createMCPService, MCPInsertDataRequest } from "../utils/mcp-service";
import type { ITelemetryType } from "../types/telemetry";

export const useMCPIntegration = () => {
  const settingsState = useSettingsState();
  const lastTelemetryId = useRef<string | null>(null);

  // Subscribe to telemetry updates
  useEffect(() => {
    const unsubscribe = useXBeeStore.subscribe(
      (state) => state.telemetry.history,
      (history) => {
        if (history.length === 0) return;

        const latestTelemetry = history[0]; // Most recent is at index 0
        const telemetryId = `${latestTelemetry.MISSION_TIME_S || 0}_${
          latestTelemetry.PACKET_COUNT || 0
        }`;

        // Skip if we've already processed this telemetry packet
        if (telemetryId === lastTelemetryId.current) return;
        lastTelemetryId.current = telemetryId;

        // Only insert if we have an active database filename
        if (!settingsState.currentDatabaseFilename) {
          console.log(
            "No active database filename, skipping telemetry insertion"
          );
          return;
        }

        insertTelemetryData(latestTelemetry);
      }
    );

    return unsubscribe;
  }, [settingsState.currentDatabaseFilename, settingsState.aiServicePort]);

  const insertTelemetryData = async (telemetry: ITelemetryType) => {
    try {
      if (!settingsState.currentDatabaseFilename) return;

      const mcpService = createMCPService(settingsState.aiServicePort);

      // Map telemetry data to MCP format
      const mcpData: MCPInsertDataRequest = {
        filename: settingsState.currentDatabaseFilename,
        TEAM_ID: telemetry.TEAM_ID || "TEJAS",
        mission_time_s: telemetry.MISSION_TIME_S,
        packet_count: telemetry.PACKET_COUNT,
        altitude: telemetry.ALTITUDE,
        pressure: telemetry.PRESSURE,
        temperature: telemetry.TEMPERATURE,
        voltage: telemetry.VOLTAGE,
        gnss_time: telemetry.GNSS_TIME,
        latitude: telemetry.GNSS_LATITUDE,
        longitude: telemetry.GNSS_LONGITUDE,
        gps_altitude: telemetry.GNSS_ALTITUDE,
        satellites: telemetry.GNSS_SATS,
        accel_x: telemetry.ACCEL_X,
        accel_y: telemetry.ACCEL_Y,
        accel_z: telemetry.ACCEL_Z,
        gyro_spin_rate: telemetry.GYRO_SPIN_RATE,
        flight_state: telemetry.FLIGHT_STATE,
        gyro_x: telemetry.GYRO_X,
        gyro_y: telemetry.GYRO_Y,
        gyro_z: telemetry.GYRO_Z,
        roll: telemetry.ROLL,
        pitch: telemetry.PITCH,
        yaw: telemetry.YAW,
        mag_x: telemetry.MAG_X,
        mag_y: telemetry.MAG_Y,
        mag_z: telemetry.MAG_Z,
        humidity: telemetry.HUMIDITY,
        current: telemetry.CURRENT,
        power: telemetry.POWER,
        baro_altitude: telemetry.BARO_ALTITUDE,
        air_quality_raw: telemetry.AIR_QUALITY_RAW,
        aq_ethanol_ppm: telemetry.AQ_ETHANOL_PPM,
        mcu_temp_c: telemetry.MCU_TEMP_C,
        rssi_dbm: telemetry.RSSI_DBM,
        health_flags: telemetry.HEALTH_FLAGS?.toString(),
        rtc_epoch: telemetry.RTC_EPOCH,
        cmd_echo: telemetry.CMD_ECHO,
      };

      const telemetryId = `${telemetry.MISSION_TIME_S || 0}_${
        telemetry.PACKET_COUNT || 0
      }`;
      await mcpService.insertTelemetryData(mcpData);
      console.log("Telemetry data inserted successfully:", telemetryId);
    } catch (error) {
      console.warn("Failed to insert telemetry data:", error);
    }
  };

  return {
    currentDatabaseFilename: settingsState.currentDatabaseFilename,
    isIntegrationActive: !!settingsState.currentDatabaseFilename,
  };
};
