/**
 * XBee Store - Connection Actions
 */
import type { XBeeStore, ConnectionActions } from "./types";
import { XBEE_DEFAULTS, type SerialPortOptions } from "../../types/xbee";

export const createConnectionActions = (
  set: any,
  get: () => XBeeStore
): ConnectionActions => ({
  setConnected: (connected: boolean) =>
    set((state: XBeeStore) => {
      state.connection.isConnected = connected;

      if (connected) {
        state.connection.connectionTime = new Date();
        get().addActivity("CONNECTION", undefined, "Connected to XBee");

        // Auto-start RSSI polling when connected
        setTimeout(() => {
          const store = get();
          if (
            store.connection.isConnected &&
            !store.communication.rssiPolling.isActive
          ) {
            store.startRSSIPolling(5000); // 5-second interval
          }
        }, 2000); // Wait 2 seconds after connection
      } else {
        state.connection.connectionTime = null;
        get().addActivity("CONNECTION", undefined, "Disconnected from XBee");

        // Stop RSSI polling when disconnected
        if (state.communication.rssiPolling.isActive) {
          if (state.communication.rssiPolling.timerId) {
            clearInterval(state.communication.rssiPolling.timerId);
            state.communication.rssiPolling.timerId = null;
          }
          state.communication.rssiPolling.isActive = false;
          state.communication.rssiPolling.lastPollTime = null;
        }
      }
    }),

  setAvailablePorts: (ports: any[]) =>
    set((state: XBeeStore) => {
      state.connection.availablePorts = ports;
    }),

  setSelectedPort: (port: string | null) =>
    set((state: XBeeStore) => {
      state.connection.selectedPort = port;
    }),

  scanPorts: async () => {
    try {
      if (!window.electronAPI?.serial) return;
      const result = await window.electronAPI.serial.listPorts();
      if (result.success) {
        get().setAvailablePorts(result.ports);
      }
    } catch (error) {
      console.error("Failed to scan ports:", error);
      get().addActivity("ERROR", undefined, "Failed to scan ports");
    }
  },

  connect: async (port: string) => {
    try {
      if (!window.electronAPI?.serial) return false;

      const options: SerialPortOptions = {
        baudRate: XBEE_DEFAULTS.BAUDRATE,
        dataBits: XBEE_DEFAULTS.DATA_BITS,
        stopBits: XBEE_DEFAULTS.STOP_BITS,
        parity: XBEE_DEFAULTS.PARITY,
      } as SerialPortOptions;

      const result = await window.electronAPI.serial.open(port, options);
      if (result.success) {
        get().setConnected(true);
        get().setSelectedPort(port);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect:", error);
      get().addActivity("ERROR", undefined, `Failed to connect to ${port}`);
      return false;
    }
  },

  disconnect: async () => {
    try {
      if (window.electronAPI?.serial) {
        await window.electronAPI.serial.close();
      }
      get().setConnected(false);
      get().setSelectedPort(null);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      get().addActivity("ERROR", undefined, "Failed to disconnect");
    }
  },

  setAutoDetecting: (detecting: boolean) =>
    set((state: XBeeStore) => {
      state.connection.autoDetecting = detecting;
    }),

  autoDetectAndConnect: async () => {
    try {
      set((state: XBeeStore) => {
        state.connection.autoDetecting = true;
      });
      get().addActivity(
        "CONNECTION",
        undefined,
        "Auto-detecting XBee devices..."
      );

      // First, scan for available ports
      await get().scanPorts();
      const ports = get().connection.availablePorts;

      if (ports.length === 0) {
        get().addActivity("ERROR", undefined, "No serial ports found");
        set((state: XBeeStore) => {
          state.connection.autoDetecting = false;
        });
        return false;
      }

      // Try to connect to each port and test for XBee response
      for (const port of ports) {
        try {
          get().addActivity("CONNECTION", undefined, `Testing ${port.path}...`);

          // Filter for likely XBee devices (USB-based, common manufacturers)
          const isLikelyXBee =
            port.path?.toLowerCase().includes("usb") ||
            port.manufacturer?.toLowerCase().includes("digi") ||
            port.manufacturer?.toLowerCase().includes("ftdi") ||
            port.manufacturer?.toLowerCase().includes("xbee") ||
            port.productId === "6001" || // FTDI chip commonly used in XBee
            port.vendorId === "0403"; // FTDI vendor ID

          if (isLikelyXBee) {
            const connected = await get().connect(port.path);
            if (connected) {
              // Give XBee time to initialize
              await new Promise((resolve) => setTimeout(resolve, 1000));

              get().addActivity(
                "CONNECTION",
                undefined,
                `XBee detected on ${port.path}`
              );
              set((state: XBeeStore) => {
                state.connection.autoDetecting = false;
              });
              return true;
            }
          }
        } catch (error) {
          console.error(`Failed to test ${port.path}:`, error);
        }
      }

      get().addActivity("ERROR", undefined, "No XBee devices detected");
      set((state: XBeeStore) => {
        state.connection.autoDetecting = false;
      });
      return false;
    } catch (error) {
      console.error("Auto-detection failed:", error);
      get().addActivity("ERROR", undefined, "Auto-detection failed");
      set((state: XBeeStore) => {
        state.connection.autoDetecting = false;
      });
      return false;
    }
  },
});
