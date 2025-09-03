import { app, BrowserWindow, Menu } from "electron";
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
    autoHideMenuBar: !isDev,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173").catch((err) => {
      console.error("Failed to load development server:", err);
    });
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow
      .loadFile(path.join(__dirname, "../dist/index.html"))
      .catch((err) => {
        console.error("Failed to load production file:", err);
      });
  }

  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Create menu template
const menuTemplate: Electron.MenuItemConstructorOptions[] = [];

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Set menu
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
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
