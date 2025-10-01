const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Window state listeners
  onMaximizeChange: (callback) => {
    const listener = (event, isMaximized) => callback(isMaximized);
    ipcRenderer.on('maximize-change', listener);
    // Return unsubscribe function
    return () => ipcRenderer.removeListener('maximize-change', listener);
  },
  
  // Always on top
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
  onAlwaysOnTopChanged: (callback) => {
    ipcRenderer.on('always-on-top-changed', (event, value) => callback(value));
  },
  
  // Persistent storage
  store: {
    get: (key, defaultValue) => ipcRenderer.invoke('get-store-value', key, defaultValue),
    set: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
    delete: (key) => ipcRenderer.invoke('delete-store-value', key),
    clear: () => ipcRenderer.invoke('clear-store'),
  },
  
  // Notifications
  scheduleNotification: (data) => ipcRenderer.invoke('schedule-notification', data),
  sendNotification: (data) => ipcRenderer.invoke('send-notification', data),
  
  // Weather (bypass CORS)
  fetchWeather: (coords) => ipcRenderer.invoke('fetch-weather', coords),
  fetchLocation: () => ipcRenderer.invoke('fetch-location'),
  
  // Tray updates
  updatePomodoroState: (state) => ipcRenderer.invoke('update-pomodoro-state', state),
  updateUpcomingEvents: (events) => ipcRenderer.invoke('update-upcoming-events', events),
  
  // Tray actions listeners
  onShowNoteInput: (callback) => {
    ipcRenderer.on('show-note-input', callback);
  },
  onShowTodayEvents: (callback) => {
    ipcRenderer.on('show-today-events', callback);
  },
  onTriggerFocusMode: (callback) => {
    ipcRenderer.on('trigger-focus-mode', callback);
  },
  
  // Keyboard shortcuts
  onKeyboardShortcut: (callback) => {
    const listener = (event, action) => callback(action);
    ipcRenderer.on('keyboard-shortcut', listener);
    // Return unsubscribe function
    return () => ipcRenderer.removeListener('keyboard-shortcut', listener);
  },
  
  // Platform info
  platform: process.platform,
});
