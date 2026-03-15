import type { XBeeStore, ActivityActions, ActivityItem } from "./types";
import { boundedUnshift } from "./helpers";

export const createActivityActions = (
  set: any,
  _get: () => XBeeStore
): ActivityActions => ({
  addActivity: (
    type: ActivityItem["type"],
    frameType?: string,
    details?: string
  ) =>
    set((state: XBeeStore) => {
      const activity: ActivityItem = {
        timestamp: new Date(),
        type,
        frameType,
        details,
      };

      boundedUnshift(state.activity.log, activity, 200);
    }),

  clearActivityLog: () =>
    set((state: XBeeStore) => {
      state.activity.log = [];
    }),
});
