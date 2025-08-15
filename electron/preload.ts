import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  // Example methods you can use in your React app
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,

  // IPC communication methods
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      ipcRenderer.send(channel, ...args);
    },
    invoke: (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, ...args);
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const subscription = (_event: any, ...args: any[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
  },
});

// Types for the exposed API (you can move this to a separate .d.ts file)
export interface IElectronAPI {
  getVersion: () => string;
  getPlatform: () => string;
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, func: (...args: any[]) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
