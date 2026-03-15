export {};

declare global {
  interface Window {
    electronAPI?: {
      serial: {
        listPorts: () => Promise<{
          success: boolean;
          ports: Array<Record<string, any>>;
          error?: string;
        }>;
        open: (
          path: string,
          options: Record<string, any>
        ) => Promise<{ success: boolean; error?: string }>;
        close: () => Promise<{ success: boolean; error?: string }>;
        write: (
          data: number[]
        ) => Promise<{ success: boolean; error?: string }>;
        status: () => Promise<{ isOpen: boolean; path: string | null }>;

        onDataReceived: (callback: (data: number[]) => void) => () => void;
        onError: (callback: (error: string) => void) => () => void;
        onPortClosed: (callback: () => void) => () => void;
      };
      xbee: {
        sendFrame: (
          frameData: Record<string, any>
        ) => Promise<{ success: boolean; error?: string }>;
        onFrameReceived: (callback: (frame: any) => void) => () => void;
      };
      shell: {
        openExternal: (url: string) => void;
      };
      installer: {
        saveCopy: () => Promise<{
          success: boolean;
          reason?: string;
          path?: string;
        }>;
      };
    };
  }
}
