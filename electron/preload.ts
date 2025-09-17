import { contextBridge, ipcRenderer } from "electron";

interface ElectronAPI {
  serial: {
    listPorts: () => Promise<any>;
    open: (path: string, options: any) => Promise<any>;
    close: () => Promise<any>;
    write: (data: number[]) => Promise<any>;
    status: () => Promise<any>;

    onDataReceived: (callback: (data: number[]) => void) => () => void;
    onError: (callback: (error: string) => void) => () => void;
    onPortClosed: (callback: () => void) => () => void;
  };
  xbee: {
    sendFrame: (frameData: any) => Promise<any>;
    onFrameReceived: (callback: (frame: any) => void) => () => void;
  };
}

const electronAPI: ElectronAPI = {
  serial: {
    listPorts: () => ipcRenderer.invoke("serial:list-ports"),
    open: (path, options) => ipcRenderer.invoke("serial:open", path, options),
    close: () => ipcRenderer.invoke("serial:close"),
    write: (data) => ipcRenderer.invoke("serial:write", data),
    status: () => ipcRenderer.invoke("serial:status"),

    onDataReceived: (callback) => {
      const listener = (_event: any, data: number[]) => callback(data);
      ipcRenderer.on("serial:data-received", listener);
      return () => ipcRenderer.removeListener("serial:data-received", listener);
    },
    onError: (callback) => {
      const listener = (_event: any, error: string) => callback(error);
      ipcRenderer.on("serial:error", listener);
      return () => ipcRenderer.removeListener("serial:error", listener);
    },
    onPortClosed: (callback) => {
      const listener = () => callback();
      ipcRenderer.on("serial:port-closed", listener);
      return () => ipcRenderer.removeListener("serial:port-closed", listener);
    },
  },
  xbee: {
    sendFrame: (frameData) => ipcRenderer.invoke("xbee:send-frame", frameData),
    onFrameReceived: (callback) => {
      const listener = (_event: any, frame: any) => callback(frame);
      ipcRenderer.on("xbee:frame-received", listener);
      return () => ipcRenderer.removeListener("xbee:frame-received", listener);
    },
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
