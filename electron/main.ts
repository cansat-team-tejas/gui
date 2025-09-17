import { app, BrowserWindow, Menu, globalShortcut } from "electron";
import * as path from "path";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

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
    autoHideMenuBar: true, // Always hide menu bar initially
    frame: true, // Keep frame for window controls when not in fullscreen
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173").catch((err) => {
      console.error("Failed to load development server:", err);
    });
  } else {
    mainWindow
      .loadFile(path.join(__dirname, "../dist/index.html"))
      .catch((err) => {
        console.error("Failed to load production file:", err);
      });
  }

  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      // Start in true fullscreen mode with no menu bar
      mainWindow.setMenuBarVisibility(false);
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Create menu template
const menuTemplate: Electron.MenuItemConstructorOptions[] = [
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
            if (!isFullScreen) {
              // Enter true fullscreen mode
              mainWindow.setFullScreen(true);
              mainWindow.setMenuBarVisibility(false);
            } else {
              // Exit fullscreen mode
              mainWindow.setFullScreen(false);
              mainWindow.setMenuBarVisibility(true);
            }
          }
        },
      },
      { type: "separator" },
      {
        label: "Reload",
        accelerator: "CommandOrControl+R",
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.reload();
          }
        },
      },
    ],
  },
];

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Set menu
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Register global shortcuts
  registerGlobalShortcuts();
});

function registerGlobalShortcuts(): void {
  // Ctrl+I to toggle developer tools
  globalShortcut.register("CommandOrControl+I", () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Ctrl+F to toggle fullscreen
  globalShortcut.register("CommandOrControl+F", () => {
    if (mainWindow) {
      const isFullScreen = mainWindow.isFullScreen();
      if (!isFullScreen) {
        // Enter true fullscreen mode
        mainWindow.setFullScreen(true);
        mainWindow.setMenuBarVisibility(false);
      } else {
        // Exit fullscreen mode
        mainWindow.setFullScreen(false);
        mainWindow.setMenuBarVisibility(true);
      }
    }
  });
}

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    console.log("Blocked new window creation for URL:", url);
    return { action: "deny" };
  });
});

// Security: Prevent navigation to external URLs
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (
      parsedUrl.origin !== "http://localhost:5173" &&
      parsedUrl.origin !== "file://"
    ) {
      event.preventDefault();
      console.log("Blocked navigation to:", navigationUrl);
    }
  });
});
