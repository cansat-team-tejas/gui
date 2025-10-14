/**
 * MCP Integration Hook
 * Synchronizes mission metadata between the Go backend and GUI state.
 * Automatic telemetry ingestion is now handled server-side, so the hook
 * no longer mirrors telemetry data manually.
 */
import { useEffect } from "react";
import { useXBeeGoStore } from "../store/xbee-go";
import { useSettingsState } from "../pages/settings/hooks";

export const useMCPIntegration = () => {
  const settingsState = useSettingsState();
  const { setCurrentDatabaseFilename, currentDatabaseFilename } = settingsState;

  useEffect(() => {
    const unsubscribeMission = useXBeeGoStore.subscribe(
      (state) => state.mission.currentMission,
      (mission) => {
        const dbPath = mission?.dbPath ?? null;

        if (dbPath && currentDatabaseFilename !== dbPath) {
          setCurrentDatabaseFilename(dbPath);
          return;
        }

        if (!dbPath && currentDatabaseFilename) {
          setCurrentDatabaseFilename(null);
        }
      }
    );

    return unsubscribeMission;
  }, [currentDatabaseFilename, setCurrentDatabaseFilename]);

  return {
    currentDatabaseFilename,
    isIntegrationActive: !!currentDatabaseFilename,
  };
};
