import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import {
  FRAME_TYPES,
  MISSION_CONFIG,
  SerialPortOptions,
  XBEE_DEFAULTS,
  XBeeTransmitFrame,
} from "../types/xbee";

interface IXBeeStateType {
  isConnected: boolean;
  availablePorts: any[];
  selectedPort: string | null;
  receivedData: string[];
}

type IActionType =
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_AVAILABLE_PORTS"; payload: any[] }
  | { type: "SET_SELECTED_PORT"; payload: string | null }
  | { type: "ADD_RECEIVED_DATA"; payload: string }
  | { type: "CLEAR_RECEIVED_DATA" };

const INITIAL_STATE: IXBeeStateType = {
  isConnected: false,
  availablePorts: [],
  selectedPort: null,
  receivedData: [],
};

const reducer = (
  state: IXBeeStateType,
  action: IActionType
): IXBeeStateType => {
  switch (action.type) {
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };
    case "SET_AVAILABLE_PORTS":
      return { ...state, availablePorts: action.payload };
    case "SET_SELECTED_PORT":
      return { ...state, selectedPort: action.payload };
    case "ADD_RECEIVED_DATA":
      return {
        ...state,
        receivedData: [
          `${new Date().toLocaleTimeString()}: ${action.payload}`,
          ...state.receivedData.slice(0, 99),
        ],
      };
    case "CLEAR_RECEIVED_DATA":
      return { ...state, receivedData: [] };
    default:
      return state;
  }
};

interface IUseXbeeContextType extends IXBeeStateType {
  scanPorts: () => Promise<void>;
  connect: (port: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  transmit: (data: string) => Promise<boolean>;
  setSelectedPort: (port: string) => void;
  clearReceivedData: () => void;
}

interface IXbeeProviderType {
  children: ReactNode;
}

const XBeeContext = createContext<IUseXbeeContextType | undefined>(undefined);

export const useXBee = (): IUseXbeeContextType => {
  const context = useContext(XBeeContext);
  if (!context) {
    throw new Error("useXBee must be used within XBeeProvider");
  }
  return context;
};

export const XBeeProvider = ({ children }: IXbeeProviderType) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubscribeFrame = window.electronAPI.xbee.onFrameReceived(
      (frame: any) => {
        if (frame.type === FRAME_TYPES.RX_PACKET && frame.data) {
          try {
            const dataString = new TextDecoder().decode(
              new Uint8Array(frame.data)
            );
            dispatch({ type: "ADD_RECEIVED_DATA", payload: dataString });
          } catch (error) {
            console.error("Failed to decode received data:", error);
          }
        }
      }
    );

    const unsubscribePortClosed = window.electronAPI.serial.onPortClosed(() => {
      dispatch({ type: "SET_CONNECTED", payload: false });
    });

    return () => {
      unsubscribeFrame();
      unsubscribePortClosed();
    };
  }, []);

  const scanPorts = useCallback(async () => {
    try {
      if (!window.electronAPI?.serial) return;
      const result = await window.electronAPI.serial.listPorts();
      if (result.success) {
        dispatch({ type: "SET_AVAILABLE_PORTS", payload: result.ports });
      }
    } catch (error) {
      console.error("Failed to scan ports:", error);
    }
  }, []);

  const connect = useCallback(async (port: string): Promise<boolean> => {
    try {
      if (!window.electronAPI?.serial) return false;
      const portOptions: SerialPortOptions = {
        baudRate: XBEE_DEFAULTS.BAUDRATE,
        dataBits: XBEE_DEFAULTS.DATA_BITS,
        stopBits: XBEE_DEFAULTS.STOP_BITS,
        parity: XBEE_DEFAULTS.PARITY,
      };
      const result = await window.electronAPI.serial.open(port, portOptions);
      if (result.success) {
        dispatch({ type: "SET_CONNECTED", payload: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect:", error);
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (window.electronAPI?.serial) {
        await window.electronAPI.serial.close();
      }
      dispatch({ type: "SET_CONNECTED", payload: false });
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, []);

  const transmit = useCallback(
    async (data: string): Promise<boolean> => {
      try {
        if (!window.electronAPI?.xbee || !state.isConnected) return false;

        const dataBytes = new Uint8Array(new TextEncoder().encode(data));

        const frame: XBeeTransmitFrame = {
          type: FRAME_TYPES.TX_REQUEST,
          id: Math.floor(Math.random() * 255) + 1,
          destination64: MISSION_CONFIG.DESTINATION_ADDRESS,
          destination16: XBEE_DEFAULTS.BROADCAST_ADDRESS_16,
          broadcastRadius: 0,
          options: 0,
          data: dataBytes,
        };

        const result = await window.electronAPI.xbee.sendFrame(frame);
        return result.success;
      } catch (error) {
        console.error("Failed to transmit:", error);
        return false;
      }
    },
    [state.isConnected]
  );

  const setSelectedPort = useCallback((port: string) => {
    dispatch({ type: "SET_SELECTED_PORT", payload: port });
  }, []);

  const clearReceivedData = useCallback(() => {
    dispatch({ type: "CLEAR_RECEIVED_DATA" });
  }, []);

  return (
    <XBeeContext.Provider
      value={{
        ...state,
        scanPorts,
        connect,
        disconnect,
        transmit,
        setSelectedPort,
        clearReceivedData,
      }}
    >
      {children}
    </XBeeContext.Provider>
  );
};
