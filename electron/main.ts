import { app, BrowserWindow, dialog, Menu, globalShortcut, ipcMain, shell } from "electron";
import * as fs from "fs";
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

function resolveIconPath(): string | undefined {
  const candidates = isDev
    ? [
        path.join(process.cwd(), "public", "images", "logo-1.ico"),
        path.join(process.cwd(), "public", "images", "logo-1.png"),
        path.join(process.cwd(), "public", "images", "logo-1.svg"),
      ]
    : [
        path.join(process.resourcesPath, "icon.ico"),
        path.join(__dirname, "..", "dist", "images", "logo-1.ico"),
        path.join(__dirname, "..", "dist", "images", "logo-1.png"),
        path.join(__dirname, "..", "dist", "images", "logo-1.svg"),
      ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

// -- Electron Window Setup --
function createWindow(): void {
  const iconPath = resolveIconPath();
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
    icon: iconPath,
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
  // Ensure correct taskbar grouping on Windows; should match build.appId
  app.setAppUserModelId("com.cansat.gui");
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

// -- Shell helpers --

ipcMain.on("shell:open-external", (_event, url: string) => {
  // Only allow https URLs to prevent SSRF / arbitrary process execution
  if (typeof url === "string" && url.startsWith("https://")) {
    shell.openExternal(url);
  }
});

// -- Installer download helper --
// Search order for the installer:
//   1. public/downloads/CanSat-Setup.exe   (copied there by build script)
//   2. release/*.exe                        (raw electron-builder output)
// Opens a native Save As dialog so the user can copy it wherever they like.
ipcMain.handle("installer:save-copy", async () => {
  const appRoot = isDev
    ? path.join(app.getAppPath())
    : path.join(app.getAppPath(), "..");

  // Candidate locations, in priority order
  const candidates: string[] = [
    path.join(appRoot, "public", "downloads", "CanSat-Setup.exe"),
    path.join(appRoot, "dist", "downloads", "CanSat-Setup.exe"),
  ];

  // Also scan release/ for any .exe with the latest alphabetically
  const releaseDir = path.join(appRoot, "release");
  try {
    const exes = fs
      .readdirSync(releaseDir)
      .filter((f: string) => f.endsWith(".exe") && !f.includes("blockmap"))
      .sort();
    if (exes.length > 0) {
      candidates.push(path.join(releaseDir, exes[exes.length - 1]));
    }
  } catch {
    // release/ doesn't exist — that's fine
  }

  const installerPath = candidates.find((c) => fs.existsSync(c));

  if (!installerPath) {
    return { success: false, reason: "not-found" };
  }

  const { canceled, filePath: destPath } = await dialog.showSaveDialog(
    mainWindow!,
    {
      title: "Save CanSat Installer",
      defaultPath: "CanSat-Setup.exe",
      filters: [{ name: "Windows Installer", extensions: ["exe"] }],
    }
  );

  if (canceled || !destPath) {
    return { success: false, reason: "canceled" };
  }

  fs.copyFileSync(installerPath, destPath);
  return { success: true, path: destPath };
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
      } else if (frame.type === 0x90 || frame.type === 0x91) {
        // Standard (0x90) or Explicit (0x91) RX frames
        // Both frame types can carry telemetry/command data
        if (frame.data && Buffer.isBuffer(frame.data)) {
          // Guard against zero-length payloads
          if (frame.data.length === 0) {
            console.warn(
              `Received empty ${
                frame.type === 0x91 ? "explicit" : "standard"
              } RX frame`
            );
            return;
          }

          // Convert buffer to string for text-based telemetry
          frame.data = frame.data.toString();

          // For explicit frames (0x91), include cluster ID for packet type filtering
          if (frame.type === 0x91) {
            // Cluster ID mapping (matches firmware packet types):
            // 0x0001 = TELEMETRY
            // 0x0002 = LOG
            // 0x0003 = CMD_RESPONSE
            frame.explicitMetadata = {
              sourceEndpoint: frame.sourceEndpoint,
              destinationEndpoint: frame.destinationEndpoint,
              clusterId: frame.clusterId,
              profileId: frame.profileId,
            };

            // Add packet type hint based on cluster ID for easier processing
            if (frame.clusterId === 0x0001) {
              frame.packetType = "TELEMETRY";
            } else if (frame.clusterId === 0x0002) {
              frame.packetType = "LOG";
            } else if (frame.clusterId === 0x0003) {
              frame.packetType = "CMD_RESPONSE";
            } else {
              frame.packetType = "UNKNOWN";
            }
          }
        }
        mainWindow?.webContents.send("xbee:frame-received", frame);
      } else {
        // Other frame types - pass through as-is
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
