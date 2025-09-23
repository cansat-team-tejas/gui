/**
 * XBee Store - Transmission Actions
 */
import {
  MISSION_CONFIG,
  XBEE_DEFAULTS,
  type XBeeTransmitFrame,
} from "../../types/xbee";
import type { XBeeStore, TransmissionActions } from "./types";

export const createTransmissionActions = (
  set: any,
  get: () => XBeeStore
): TransmissionActions => ({
  transmit: async (data: string) => {
    try {
      if (!window.electronAPI?.xbee || !get().connection.isConnected) {
        return false;
      }

      const DATA_BYTES = new Uint8Array(new TextEncoder().encode(data));

      const frame: XBeeTransmitFrame = {
        type: 0x10,
        id: Math.floor(Math.random() * 255) + 1,
        destination64: MISSION_CONFIG.DESTINATION_ADDRESS,
        destination16: XBEE_DEFAULTS.BROADCAST_ADDRESS_16,
        broadcastRadius: 0,
        options: 0,
        data: DATA_BYTES,
      } as XBeeTransmitFrame;

      const result = await window.electronAPI.xbee.sendFrame(frame);
      if (result.success) {
        set((state: XBeeStore) => {
          state.statistics.packetsSent += 1;
        });
        get().addActivity("FRAME_SENT", "TX_REQUEST", `Sent ${data.length}B`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to transmit:", error);
      set((state: XBeeStore) => {
        state.statistics.errorsCount += 1;
      });
      get().addActivity("ERROR", undefined, "Transmission failed");
      return false;
    }
  },
});
