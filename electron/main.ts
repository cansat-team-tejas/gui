import { app, BrowserWindow, Menu, globalShortcut, ipcMain } from "electron";
import * as path from "path";
import { SerialPort } from "serialport";
const xbeeApi = require("xbee-api");

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
/** Only ever allow **one** open serial/XBee at a time in GUI */
let activeSerialPort: SerialPort | null = null;
let xbee: any = null;

// -- XBee API setup: always API-escaped mode (mode 2) --
const xbeeApiOptions = {
  api_mode: 2,
  module: "ZigBee",
};

// -- Electron Window Setup (unchanged) --
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "default",
    show: false,
    autoHideMenuBar: true,
    frame: true,
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5178").catch(console.error);
  } else {
    mainWindow
      .loadFile(path.join(__dirname, "../dist/index.html"))
      .catch(console.error);
  }

  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.setMenuBarVisibility(false);
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  const menu = Menu.buildFromTemplate([
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Developer Tools",
          accelerator: "CommandOrControl+I",
          click: () => {
            if (mainWindow) {
              if (mainWindow.webContents.isDevToolsOpened()) {
                mainWindow.webContents.closeDevTools();
              } else {
                mainWindow.webContents.openDevTools();
              }
            }
          },
        },
        {
          label: "Toggle Fullscreen",
          accelerator: "CommandOrControl+F",
          click: () => {
            if (mainWindow) {
              const isFullScreen = mainWindow.isFullScreen();
              mainWindow.setFullScreen(!isFullScreen);
              mainWindow.setMenuBarVisibility(isFullScreen);
            }
          },
        },
        { type: "separator" },
        {
          label: "Reload",
          accelerator: "CommandOrControl+R",
          click: () => {
            if (mainWindow) mainWindow.webContents.reload();
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
  registerGlobalShortcuts();
});

// -- Serial Port Management with XBee (modern) --

// List available serial ports
ipcMain.handle("serial:list-ports", async () => {
  try {
    const ports = await SerialPort.list();
    return { success: true, ports };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// Open serial port and set up XBee
ipcMain.handle("serial:open", async (event, portPath: string, options: any) => {
  try {
    if (activeSerialPort?.isOpen) {
      // Close any existing port
      await new Promise((resolve) =>
        activeSerialPort!.close(() => resolve(true))
      );
    }
    // Safely destroy previous API
    xbee = new xbeeApi.XBeeAPI(xbeeApiOptions);

    activeSerialPort = new SerialPort({
      path: portPath,
      baudRate: options.baudRate || 9600,
      dataBits: options.dataBits || 8,
      stopBits: options.stopBits || 1,
      parity: options.parity || "none",
      autoOpen: false,
    });

    await new Promise<void>((resolve, reject) => {
      activeSerialPort!.open((err) => (err ? reject(err) : resolve()));
    });

    // Pipe for XBee API parsing
    activeSerialPort!.pipe(xbee.parser);
    xbee.builder.pipe(activeSerialPort!);

    xbee.parser.on("data", (frame: any) => {
      // Handle different frame types appropriately
      if (frame.type === 0x88) {
        // AT Response frame - keep structured data
        mainWindow?.webContents.send("xbee:frame-received", {
          type: "AT_RESPONSE",
          frameType: frame.type,
          frameId: frame.id,
          command: frame.command,
          status: frame.commandStatus,
          value: frame.commandData
            ? frame.commandData.length === 1
              ? frame.commandData[0]
              : frame.commandData
            : null,
          timestamp: new Date(),
        });
      } else {
        // Other frames (telemetry data) - convert to string
        if (frame.data && Buffer.isBuffer(frame.data)) {
          frame.data = frame.data.toString();
        }
        mainWindow?.webContents.send("xbee:frame-received", frame);
      }
    });
    activeSerialPort!.on("error", (err) => {
      mainWindow?.webContents.send("serial:error", err?.message || String(err));
    });

    activeSerialPort!.on("close", () => {
      mainWindow?.webContents.send("serial:port-closed");
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// Close serial port cleanly
ipcMain.handle("serial:close", async () => {
  try {
    if (activeSerialPort && activeSerialPort.isOpen) {
      await new Promise<void>((resolve) => {
        activeSerialPort!.close(() => {
          activeSerialPort = null;
          xbee = null;
          resolve();
        });
      });
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// Write XBee API frame to XBee (API mode)
ipcMain.handle("xbee:send-frame", async (event, frameData: any) => {
  try {
    if (!activeSerialPort?.isOpen || !xbee) {
      return { success: false, error: "XBee not connected" };
    }
    const builtFrame = xbee.buildFrame(frameData);
    await new Promise<void>((resolve, reject) =>
      activeSerialPort!.write(builtFrame, (err) =>
        err ? reject(err) : resolve()
      )
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// Write raw bytes to serial
ipcMain.handle("serial:write", async (event, data: number[]) => {
  try {
    if (!activeSerialPort?.isOpen) {
      return { success: false, error: "Serial port not open" };
    }
    const buffer = Buffer.from(data);
    await new Promise<void>((resolve, reject) =>
      activeSerialPort!.write(buffer, (err) => (err ? reject(err) : resolve()))
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// Port status
ipcMain.handle("serial:status", async () => {
  return {
    isOpen: activeSerialPort?.isOpen || false,
    path: activeSerialPort?.path || null,
  };
});

// Clean, modern platform/shortcut/activation, no change from your previous logic:
function registerGlobalShortcuts(): void {
  globalShortcut.register("CommandOrControl+I", () => {
    if (mainWindow)
      mainWindow.webContents.isDevToolsOpened()
        ? mainWindow.webContents.closeDevTools()
        : mainWindow.webContents.openDevTools();
  });
  globalShortcut.register("CommandOrControl+F", () => {
    if (mainWindow) {
      const isFullScreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullScreen);
      mainWindow.setMenuBarVisibility(isFullScreen);
    }
  });
}

app.on("window-all-closed", () => {
  globalShortcut.unregisterAll();
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  contents.on("will-navigate", (event, navigationUrl) => {
    const allowed = new URL(navigationUrl).origin;
    if (allowed !== "http://localhost:5173" && allowed !== "file://") {
      event.preventDefault();
    }
  });
});
