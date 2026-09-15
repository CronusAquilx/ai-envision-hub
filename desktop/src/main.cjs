/**
 * NEXUS AI desktop shell.
 *
 * The window hosts the NEXUS front end, but every local capability runs in this
 * process and the local bridge — native folder pickers, permission grants, OS
 * notifications, multi-window support and the loopback RPC server.
 */
const { app, BrowserWindow, dialog, ipcMain, Menu, Notification, shell } = require("electron");
const path = require("node:path");

const bridge = require("./bridge.cjs");

const APP_URL = process.env.NEXUS_APP_URL || "https://nexus-ai.lovable.app";
const windows = new Set();

function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 960,
    backgroundColor: "#0a0b0d",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadURL(APP_URL);
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
  windows.add(win);
  win.on("closed", () => windows.delete(win));
  return win;
}

function broadcast(payload) {
  for (const win of windows) win.webContents.send("nexus:event", payload);
}

function buildMenu() {
  const template = [
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [
        {
          label: "Grant folder access…",
          accelerator: "CmdOrCtrl+Shift+O",
          click: () => void grantFolder(),
        },
        { label: "New window", accelerator: "CmdOrCtrl+Shift+N", click: () => createWindow() },
        { type: "separator" },
        { role: process.platform === "darwin" ? "close" : "quit" },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    {
      label: "Help",
      submenu: [
        { label: "Help centre", click: () => void shell.openExternal(`${APP_URL}/help`) },
        { label: "Check for updates", click: () => checkForUpdates() },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function grantFolder() {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
  if (result.canceled || !result.filePaths[0]) return null;
  const folder = result.filePaths[0];
  await bridge.methods["grants.add"]({ path: folder });
  broadcast({ type: "grants.changed", grants: bridge.getGrants() });
  return folder;
}

function checkForUpdates() {
  // Update feed hook: electron-builder publishes to the release channel and the
  // shell surfaces the result. Without a configured feed this reports current.
  broadcast({ type: "update.status", status: "current", version: app.getVersion() });
  new Notification({ title: "NEXUS AI", body: `You are on version ${app.getVersion()}.` }).show();
}

app.whenReady().then(() => {
  bridge.createBridgeServer();
  buildMenu();
  createWindow();

  ipcMain.handle("nexus:bridge-token", () => bridge.getToken());
  ipcMain.handle("nexus:grants", () => bridge.getGrants());
  ipcMain.handle("nexus:pick-folder", () => grantFolder());
  ipcMain.handle("nexus:revoke-folder", async (_e, folder) => {
    await bridge.methods["grants.remove"]({ path: folder });
    broadcast({ type: "grants.changed", grants: bridge.getGrants() });
    return bridge.getGrants();
  });
  ipcMain.handle("nexus:notify", (_e, { title, body }) => {
    new Notification({ title: title || "NEXUS AI", body: body || "" }).show();
    return true;
  });
  ipcMain.handle("nexus:new-window", () => {
    createWindow();
    return true;
  });
  ipcMain.handle("nexus:check-updates", () => {
    checkForUpdates();
    return app.getVersion();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
