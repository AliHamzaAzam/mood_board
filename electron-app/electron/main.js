const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, globalShortcut, net } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize electron-store for persistence
const store = new Store();

let mainWindow;
let tray;
let isAlwaysOnTop = false;
let pomodoroState = { isActive: false, timeRemaining: 0, sessionType: 'work' };
let upcomingEvents = [];

// Check if running in development mode
const isDev = !app.isPackaged;

function createWindow() {
  // Create the browser window with custom frame
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false, // Custom window frame
    titleBarStyle: 'hiddenInset', // Completely hide native titlebar including traffic lights
    trafficLightPosition: { x: -200, y: -200 }, // Push native traffic lights off-screen
    backgroundColor: '#fef3e2',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false, // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Restore always-on-top state
    const savedAlwaysOnTop = store.get('alwaysOnTop', false);
    if (savedAlwaysOnTop) {
      mainWindow.setAlwaysOnTop(true);
      isAlwaysOnTop = true;
    }
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin' && !app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Send maximize state changes to renderer
  mainWindow.on('maximize', () => {
    if (mainWindow) {
      mainWindow.webContents.send('maximize-change', true);
    }
  });

  mainWindow.on('unmaximize', () => {
    if (mainWindow) {
      mainWindow.webContents.send('maximize-change', false);
    }
  });
}

function createTray() {
  // Use platform-specific icon
  const iconName = process.platform === 'darwin' ? 'icon-Template.png' : 'tray-icon.png';
  const iconPath = path.join(__dirname, '../assets', iconName);
  
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // Fallback to creating an empty icon
      trayIcon = nativeImage.createEmpty();
      console.log('Tray icon is empty, using fallback');
    }
    // Template images on macOS automatically adapt to light/dark mode
    if (process.platform === 'darwin') {
      trayIcon.setTemplateImage(true);
    } else {
      trayIcon = trayIcon.resize({ width: 16, height: 16 });
    }
  } catch (error) {
    console.error('Error loading tray icon:', error);
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  
  // Set initial tooltip
  updateTrayTooltip();
  
  // Create tray menu
  updateTrayMenu();

  // Show/hide window on tray click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
  
  // Update menu on right-click (Windows/Linux)
  tray.on('right-click', () => {
    updateTrayMenu();
  });
}

function updateTrayIcon(isActive = false) {
  if (!tray) return;
  
  try {
    let iconName;
    if (process.platform === 'darwin') {
      // macOS uses template images
      iconName = 'icon-Template.png';
    } else {
      // Windows/Linux use colored icons
      iconName = isActive ? 'tray-icon-active.png' : 'tray-icon.png';
    }
    
    const iconPath = path.join(__dirname, '../assets', iconName);
    const trayIcon = nativeImage.createFromPath(iconPath);
    
    if (!trayIcon.isEmpty()) {
      if (process.platform === 'darwin') {
        trayIcon.setTemplateImage(true);
      } else {
        trayIcon.resize({ width: 16, height: 16 });
      }
      tray.setImage(trayIcon);
    }
  } catch (error) {
    console.error('Error updating tray icon:', error);
  }
}

function updateTrayTooltip() {
  if (!tray) return;
  
  let tooltip = 'September Dashboard';
  
  if (pomodoroState.isActive) {
    const minutes = Math.floor(pomodoroState.timeRemaining / 60);
    const seconds = pomodoroState.timeRemaining % 60;
    const sessionEmoji = pomodoroState.sessionType === 'work' ? '🎯' : '☕';
    tooltip = `${sessionEmoji} ${minutes}:${seconds.toString().padStart(2, '0')} - September Dashboard`;
  }
  
  tray.setToolTip(tooltip);
}

function updateTrayMenu() {
  if (!tray) return;
  
  const menuTemplate = [
    {
      label: '📅 September Dashboard',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Show Dashboard',
      accelerator: process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
  ];

  // Add Pomodoro Status if active
  if (pomodoroState.isActive) {
    const minutes = Math.floor(pomodoroState.timeRemaining / 60);
    const seconds = pomodoroState.timeRemaining % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const sessionIcon = pomodoroState.sessionType === 'work' ? '🎯' : '☕';
    const sessionLabel = pomodoroState.sessionType === 'work' ? 'Work Session' : 
                        pomodoroState.sessionType === 'longBreak' ? 'Long Break' : 'Break';
    
    menuTemplate.push(
      { type: 'separator' },
      {
        label: `${sessionIcon} ${sessionLabel}: ${timeStr}`,
        enabled: false,
      },
      {
        label: 'Pause Timer',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('keyboard-shortcut', 'toggle-pomodoro');
          }
        },
      }
    );
  } else if (pomodoroState.timeRemaining > 0) {
    menuTemplate.push(
      { type: 'separator' },
      {
        label: '⏸️ Timer Paused',
        enabled: false,
      },
      {
        label: 'Resume Timer',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('keyboard-shortcut', 'toggle-pomodoro');
          }
        },
      }
    );
  }

  // Add Upcoming Events (show next 2)
  if (upcomingEvents.length > 0) {
    menuTemplate.push({ type: 'separator' });
    menuTemplate.push({
      label: '📅 Upcoming Events',
      enabled: false,
    });
    
    const nextEvents = upcomingEvents.slice(0, 2);
    nextEvents.forEach(event => {
      const eventTime = new Date(event.date + 'T' + event.time);
      const timeStr = eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      menuTemplate.push({
        label: `   ${event.title} at ${timeStr}`,
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('show-today-events');
            mainWindow.show();
            mainWindow.focus();
          }
        },
      });
    });
    
    if (upcomingEvents.length > 2) {
      menuTemplate.push({
        label: `   +${upcomingEvents.length - 2} more...`,
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('show-today-events');
            mainWindow.show();
            mainWindow.focus();
          }
        },
      });
    }
  }

  // Quick Actions
  menuTemplate.push(
    { type: 'separator' },
    {
      label: '✏️ Quick Add Note',
      accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('show-note-input');
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: '📅 View Today\'s Events',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('show-today-events');
          mainWindow.show();
          mainWindow.focus();
        }
      },
    }
  );

  // Settings
  menuTemplate.push(
    { type: 'separator' },
    {
      label: isAlwaysOnTop ? '✓ Always on Top' : 'Always on Top',
      type: 'checkbox',
      checked: isAlwaysOnTop,
      click: () => {
        isAlwaysOnTop = !isAlwaysOnTop;
        if (mainWindow) {
          mainWindow.setAlwaysOnTop(isAlwaysOnTop);
        }
        store.set('alwaysOnTop', isAlwaysOnTop);
        updateTrayMenu();
        
        // Notify renderer process
        if (mainWindow) {
          mainWindow.webContents.send('always-on-top-changed', isAlwaysOnTop);
        }
      },
    },
    {
      label: '⚙️ Settings',
      accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('keyboard-shortcut', 'open-settings');
          mainWindow.show();
          mainWindow.focus();
        }
      },
    }
  );

  // Quit
  menuTemplate.push(
    { type: 'separator' },
    {
      label: 'Quit September Dashboard',
      accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    }
  );

  const contextMenu = Menu.buildFromTemplate(menuTemplate);
  tray.setContextMenu(contextMenu);
}

// IPC Handlers
ipcMain.handle('get-store-value', (event, key, defaultValue) => {
  return store.get(key, defaultValue);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('delete-store-value', (event, key) => {
  store.delete(key);
  return true;
});

ipcMain.handle('clear-store', () => {
  store.clear();
  return true;
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('toggle-always-on-top', () => {
  isAlwaysOnTop = !isAlwaysOnTop;
  mainWindow.setAlwaysOnTop(isAlwaysOnTop);
  store.set('alwaysOnTop', isAlwaysOnTop);
  updateTrayMenu();
  return isAlwaysOnTop;
});

ipcMain.handle('get-always-on-top', () => {
  return isAlwaysOnTop;
});

// Update Pomodoro state for tray display
ipcMain.handle('update-pomodoro-state', (event, state) => {
  pomodoroState = { ...pomodoroState, ...state };
  updateTrayIcon(pomodoroState.isActive);
  updateTrayTooltip();
  updateTrayMenu();
  return { success: true };
});

// Update upcoming events for tray display
ipcMain.handle('update-upcoming-events', (event, events) => {
  // Filter to only today's future events and sort by time
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  upcomingEvents = events
    .filter(event => {
      if (event.date !== today) return false;
      const eventDateTime = new Date(event.date + 'T' + event.time);
      return eventDateTime > now;
    })
    .sort((a, b) => {
      const timeA = new Date(a.date + 'T' + a.time);
      const timeB = new Date(b.date + 'T' + b.time);
      return timeA - timeB;
    })
    .slice(0, 5); // Keep maximum 5 events
    
  updateTrayMenu();
  return { success: true, count: upcomingEvents.length };
});

// Schedule notification for calendar events
ipcMain.handle('schedule-notification', (event, { title, body, eventTime, minutesBefore = 15 }) => {
  try {
    // Calculate time until event
    const now = Date.now();
    const eventDate = new Date(eventTime).getTime();
    const timeUntilEvent = eventDate - now;

    // Schedule notification X minutes before event (default 15, can be 5 or any value)
    const notificationTime = timeUntilEvent - (minutesBefore * 60 * 1000);

    if (notificationTime > 0) {
      setTimeout(() => {
        if (Notification.isSupported()) {
          const notification = new Notification({
            title: '📅 Upcoming Event',
            body: `${title} starts in ${minutesBefore} minutes at ${body}`,
            icon: path.join(__dirname, '../assets/icon.png'),
            timeoutType: 'default',
            urgency: 'normal',
            sound: 'default',
          });

          notification.on('click', () => {
            mainWindow.show();
            mainWindow.focus();
          });

          notification.show();
        }
      }, notificationTime);

      return { success: true, scheduledFor: new Date(now + notificationTime).toISOString() };
    }

    return { success: false, reason: 'Event time has passed' };
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return { success: false, reason: error.message };
  }
});

// Send immediate notification
ipcMain.handle('send-notification', (event, { title, body, sound = false }) => {
  try {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body,
        icon: path.join(__dirname, '../assets/icon.png'),
        urgency: 'normal',
        sound: sound ? 'default' : undefined,
      });

      notification.on('click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });

      notification.show();
      return { success: true };
    }
    return { success: false, reason: 'Notifications not supported' };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, reason: error.message };
  }
});

// Weather data fetching (bypasses CORS)
ipcMain.handle('fetch-weather', async (event, { latitude, longitude }) => {
  console.log('Weather handler called with:', latitude, longitude);
  return new Promise((resolve, reject) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;
    
    const request = net.request(url);
    
    request.on('response', (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk.toString();
      });
      
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Failed to parse weather data'));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.end();
  });
});

ipcMain.handle('fetch-location', async () => {
  console.log('Location handler called');
  return new Promise((resolve, reject) => {
    // Use ip-api.com instead (no rate limits for non-commercial use)
    const request = net.request('http://ip-api.com/json/');
    
    request.on('response', (response) => {
      let data = '';
      
      console.log('Location response status:', response.statusCode);
      
      response.on('data', (chunk) => {
        data += chunk.toString();
      });
      
      response.on('end', () => {
        console.log('Location data received:', data.substring(0, 200)); // Log first 200 chars
        try {
          const parsed = JSON.parse(data);
          console.log('Location parsed successfully:', parsed.city, parsed.country);
          // Normalize the response to match ipapi.co format
          resolve({
            latitude: parsed.lat,
            longitude: parsed.lon,
            city: parsed.city,
            country_name: parsed.country
          });
        } catch (error) {
          console.error('Failed to parse location data:', error.message);
          console.error('Raw data:', data);
          reject(new Error('Failed to parse location data'));
        }
      });
    });
    
    request.on('error', (error) => {
      console.error('Location request error:', error);
      reject(error);
    });
    
    request.end();
  });
});

console.log('Weather IPC handlers registered');

// Register global keyboard shortcuts
function registerKeyboardShortcuts() {
  // Cmd/Ctrl + N: Add new mood note
  globalShortcut.register('CommandOrControl+N', () => {
    if (mainWindow) {
      mainWindow.webContents.send('keyboard-shortcut', 'add-note');
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Cmd/Ctrl + E: Add new calendar event
  globalShortcut.register('CommandOrControl+E', () => {
    if (mainWindow) {
      mainWindow.webContents.send('keyboard-shortcut', 'add-event');
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Cmd/Ctrl + T: Start/pause Pomodoro timer
  globalShortcut.register('CommandOrControl+T', () => {
    if (mainWindow) {
      mainWindow.webContents.send('keyboard-shortcut', 'toggle-pomodoro');
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Cmd/Ctrl + ,: Open settings
  globalShortcut.register('CommandOrControl+,', () => {
    if (mainWindow) {
      mainWindow.webContents.send('keyboard-shortcut', 'open-settings');
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Cmd/Ctrl + /: Show keyboard shortcuts help
  globalShortcut.register('CommandOrControl+/', () => {
    if (mainWindow) {
      mainWindow.webContents.send('keyboard-shortcut', 'show-shortcuts-help');
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Space key removed from global shortcuts to allow typing in input fields
  // It's now handled in the React component with proper input field detection

  // Up/Down arrows: Volume control
  globalShortcut.register('Up', () => {
    if (mainWindow && mainWindow.isFocused()) {
      mainWindow.webContents.send('keyboard-shortcut', 'volume-up');
    }
  });

  globalShortcut.register('Down', () => {
    if (mainWindow && mainWindow.isFocused()) {
      mainWindow.webContents.send('keyboard-shortcut', 'volume-down');
    }
  });
}

// Unregister all keyboard shortcuts
function unregisterKeyboardShortcuts() {
  globalShortcut.unregisterAll();
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerKeyboardShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  unregisterKeyboardShortcuts();
});

app.on('will-quit', () => {
  unregisterKeyboardShortcuts();
});
