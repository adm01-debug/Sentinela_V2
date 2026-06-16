import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("sentinelaAPI", {
  getStatus: () => ipcRenderer.invoke("get-status"),
  setAgentKey: (key: string) => ipcRenderer.invoke("set-agent-key", key),
  toggleStealth: () => ipcRenderer.invoke("toggle-stealth"),
  verifyStealthPassword: (password: string) =>
    ipcRenderer.invoke("verify-stealth-password", password),
  setStealthPassword: (password: string) => ipcRenderer.invoke("set-stealth-password", password),

  // Event listeners
  onAuthSuccess: (callback: (data: unknown) => void) => {
    ipcRenderer.on("auth-success", (_event, data) => callback(data));
  },
  onAuthError: (callback: (error: string) => void) => {
    ipcRenderer.on("auth-error", (_event, error) => callback(error));
  },
  onRequestStealthPassword: (callback: () => void) => {
    ipcRenderer.on("request-stealth-password", () => callback());
  },
  onUpdateAvailable: (callback: (info: unknown) => void) => {
    ipcRenderer.on("update-available", (_event, info) => callback(info));
  },
});
