/**
 * Secure IPC surface. contextIsolation is on and nodeIntegration is off, so the
 * renderer only ever sees these narrow, validated channels.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexus", {
  isDesktop: true,
  bridgeToken: () => ipcRenderer.invoke("nexus:bridge-token"),
  grants: () => ipcRenderer.invoke("nexus:grants"),
  pickFolder: () => ipcRenderer.invoke("nexus:pick-folder"),
  revokeFolder: (folder) => ipcRenderer.invoke("nexus:revoke-folder", folder),
  notify: (title, body) => ipcRenderer.invoke("nexus:notify", { title, body }),
  newWindow: () => ipcRenderer.invoke("nexus:new-window"),
  checkForUpdates: () => ipcRenderer.invoke("nexus:check-updates"),
  onEvent: (handler) => {
    const listener = (_e, payload) => handler(payload);
    ipcRenderer.on("nexus:event", listener);
    return () => ipcRenderer.removeListener("nexus:event", listener);
  },
});
