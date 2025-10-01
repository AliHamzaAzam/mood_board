# ⌨️ Keyboard Shortcuts System

## Overview
The September Dashboard now includes comprehensive keyboard shortcuts for quick access to all major features. Global shortcuts work even when the app is in the background (on supported platforms).

## ✅ Implemented Shortcuts

### General Actions
| Shortcut | Action | Description |
|----------|--------|-------------|
| **Cmd/Ctrl + N** | Add New Mood Note | Opens the mood note input dialog |
| **Cmd/Ctrl + E** | Add New Calendar Event | Opens the calendar event modal |
| **Cmd/Ctrl + T** | Toggle Pomodoro Timer | Starts or pauses the Pomodoro timer |
| **Cmd/Ctrl + ,** | Open Settings | Opens the settings modal |
| **Cmd/Ctrl + /** | Show Keyboard Shortcuts | Displays this help modal |

### Music Player Controls
| Shortcut | Action | Description |
|----------|--------|-------------|
| **Space** | Play/Pause Music | Toggles music playback (when window focused) |
| **↑ (Up Arrow)** | Volume Up | Increases volume by 10% |
| **↓ (Down Arrow)** | Volume Down | Decreases volume by 10% |

### System
| Shortcut | Action | Description |
|----------|--------|-------------|
| **Cmd + Q** | Quit App | Quits the application (macOS only) |
| **Cmd/Ctrl + M** | Minimize Window | Minimizes the app window |
| **Cmd/Ctrl + W** | Close Window | Closes the app window |

## Architecture

### Main Process (electron/main.js)
```javascript
const { globalShortcut } = require('electron');

function registerKeyboardShortcuts() {
  // Register global shortcuts
  globalShortcut.register('CommandOrControl+N', () => {
    mainWindow.webContents.send('keyboard-shortcut', 'add-note');
    mainWindow.show();
    mainWindow.focus();
  });
  
  // ... more shortcuts
}

app.whenReady().then(() => {
  createWindow();
  registerKeyboardShortcuts();
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
});
```

### IPC Bridge (electron/preload.js)
```javascript
contextBridge.exposeInMainWorld('electron', {
  onKeyboardShortcut: (callback) => {
    const listener = (event, action) => callback(action);
    ipcRenderer.on('keyboard-shortcut', listener);
    return () => ipcRenderer.removeListener('keyboard-shortcut', listener);
  },
});
```

### React Components

#### SeptemberDashboard.jsx
```javascript
// Listen for keyboard shortcuts
useEffect(() => {
  if (isElectron) {
    const unsubscribeShortcuts = window.electron.onKeyboardShortcut((action) => {
      handleKeyboardShortcut(action);
    });
    
    return () => {
      if (unsubscribeShortcuts) unsubscribeShortcuts();
    };
  }
}, []);

// Handle keyboard shortcuts
const handleKeyboardShortcut = (action) => {
  switch (action) {
    case 'add-note':
      setShowNoteInput(true);
      break;
    case 'add-event':
      setShowEventModal(true);
      break;
    case 'toggle-pomodoro':
      pomodoroTimerRef.current?.toggleTimer();
      break;
    case 'open-settings':
      setShowSettings(true);
      break;
    case 'show-shortcuts-help':
      setShowShortcutsHelp(true);
      break;
    case 'toggle-music':
      setIsPlaying(prev => !prev);
      break;
    case 'volume-up':
      setVolume(prev => Math.min(100, prev + 10));
      break;
    case 'volume-down':
      setVolume(prev => Math.max(0, prev - 10));
      break;
  }
};
```

#### PomodoroTimer.jsx (with forwardRef)
```javascript
const PomodoroTimer = React.forwardRef(({ soundEnabled, onSessionComplete }, ref) => {
  const [isActive, setIsActive] = useState(false);
  
  // Expose toggleTimer method to parent
  React.useImperativeHandle(ref, () => ({
    toggleTimer: () => {
      setIsActive(prev => !prev);
    }
  }));
  
  return (/* ... */);
});

export default PomodoroTimer;
```

#### KeyboardShortcutsModal.jsx
```javascript
export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  const isMac = window.electron.platform === 'darwin';
  const modifierKey = isMac ? '⌘' : 'Ctrl';
  
  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Beautiful modal with all shortcuts listed */}
    </div>
  );
}
```

## UI Features

### Keyboard Shortcuts Help Modal
- **Access**: Click keyboard icon in header or press `Cmd/Ctrl + /`
- **Design**: Orange gradient header, organized by category
- **Categories**: General, Music Player, Window Controls
- **Styling**: Beautiful `<kbd>` tags for key representations
- **Platform-aware**: Shows Cmd on macOS, Ctrl on Windows/Linux

### Tooltips
All interactive elements now show keyboard shortcuts in tooltips:
- **Add Mood Note button**: Shows `(Cmd/Ctrl+N)`
- **Add Calendar Event button**: Shows `(Cmd/Ctrl+E)`
- **Open Settings button**: Shows `(Cmd/Ctrl+,)`
- **Play/Pause button**: Shows `(Space)`
- **Volume slider**: Shows `(↑/↓ Arrow Keys)`
- **Keyboard icon**: Shows `(Cmd/Ctrl+/)`

### Visual Indicators
- Keyboard icon button in header (next to settings)
- Orange accent color matching app theme
- Hover effects on all buttons
- Platform-specific key symbols (⌘ vs Ctrl)

## Technical Implementation

### Global Shortcuts
- Uses Electron's `globalShortcut` module
- Works even when app is in background (system-level)
- Automatically brings window to focus when triggered
- Properly cleaned up on app quit

### Local Shortcuts
- Space and arrow keys only work when window is focused
- Prevents interference with other applications
- Uses conditional registration

### Ref Communication
- PomodoroTimer uses `forwardRef` for parent control
- `useImperativeHandle` exposes `toggleTimer` method
- Clean, type-safe parent-child communication

### Cleanup
- All shortcuts unregistered on app quit
- IPC listeners properly unsubscribed
- No memory leaks

## Platform Differences

### macOS
- Uses ⌘ (Command) key
- Displays as "Cmd" in UI
- Native Cmd+Q to quit
- All shortcuts work globally

### Windows/Linux
- Uses Ctrl key
- Displays as "Ctrl" in UI
- Alt+F4 to quit (system default)
- All shortcuts work globally

### Detection
```javascript
const isElectron = typeof window !== 'undefined' && window.electron;
const isMac = isElectron ? window.electron.platform === 'darwin' : false;
const modifierKey = isMac ? '⌘' : 'Ctrl';
```

## Testing

### Manual Tests

#### Test 1: Add Mood Note (Cmd/Ctrl + N)
1. Press `Cmd/Ctrl + N`
2. **Expected**: Mood note input dialog opens
3. **Expected**: Window comes to focus if in background

#### Test 2: Add Calendar Event (Cmd/Ctrl + E)
1. Press `Cmd/Ctrl + E`
2. **Expected**: Calendar event modal opens
3. **Expected**: Today's date is selected

#### Test 3: Toggle Pomodoro (Cmd/Ctrl + T)
1. Press `Cmd/Ctrl + T`
2. **Expected**: Timer starts
3. Press again
4. **Expected**: Timer pauses

#### Test 4: Open Settings (Cmd/Ctrl + ,)
1. Press `Cmd/Ctrl + ,`
2. **Expected**: Settings modal opens

#### Test 5: Show Keyboard Shortcuts (Cmd/Ctrl + /)
1. Press `Cmd/Ctrl + /`
2. **Expected**: Keyboard shortcuts help modal opens
3. **Expected**: All shortcuts are listed and categorized
4. Press Escape or click X
5. **Expected**: Modal closes

#### Test 6: Play/Pause Music (Space)
1. Focus the app window
2. Press `Space`
3. **Expected**: Music starts playing
4. Press `Space` again
5. **Expected**: Music pauses

#### Test 7: Volume Control (↑/↓)
1. Focus the app window
2. Press `↑` (Up Arrow) 3 times
3. **Expected**: Volume increases by 30%
4. Press `↓` (Down Arrow) 2 times
5. **Expected**: Volume decreases by 20%

#### Test 8: Tooltips
1. Hover over "Add Mood Note" button
2. **Expected**: Tooltip shows "(Cmd/Ctrl+N)"
3. Hover over play button
4. **Expected**: Tooltip shows "(Space)"

#### Test 9: Keyboard Icon
1. Look for keyboard icon in header (next to settings)
2. Click it
3. **Expected**: Keyboard shortcuts modal opens
4. Hover over icon
5. **Expected**: Tooltip shows shortcut to open it

#### Test 10: Global vs Local
1. Focus another app (e.g., browser)
2. Press `Cmd/Ctrl + N`
3. **Expected**: September Dashboard comes to focus and opens note input
4. Press `Space`
5. **Expected**: Nothing happens in September Dashboard (focused on other app)

### Automated Tests (Future)
```javascript
describe('Keyboard Shortcuts', () => {
  it('should open note input with Cmd+N', () => {
    // Simulate Cmd+N
    // Assert note input is visible
  });
  
  it('should toggle Pomodoro with Cmd+T', () => {
    // Simulate Cmd+T
    // Assert timer started
    // Simulate Cmd+T again
    // Assert timer paused
  });
  
  it('should show shortcuts help with Cmd+/', () => {
    // Simulate Cmd+/
    // Assert modal is visible
  });
});
```

## Troubleshooting

### Shortcuts not working
1. **Check macOS permissions**: System Preferences > Security & Privacy > Privacy > Accessibility
2. **Verify app is Electron**: `console.log(window.electron)` should not be undefined
3. **Check for conflicts**: Other apps may be using same shortcuts
4. **Restart app**: Shortcuts are registered on app start

### Space bar not working
- Ensure September Dashboard window is focused
- Space only works when app has focus (not global)
- Check if other inputs have focus (text fields capture Space)

### Pomodoro toggle not working
- Verify `pomodoroTimerRef.current` is not null
- Check that PomodoroTimer is rendered with ref prop
- Console error? forwardRef may not be set up correctly

### Modal not showing
- Check `showShortcutsHelp` state in React DevTools
- Verify KeyboardShortcutsModal is imported
- Check z-index (should be 10000)

### Platform detection wrong
- Verify `window.electron.platform` returns correct value
- Check preload.js exposes `platform: process.platform`
- macOS should return 'darwin'

## Future Enhancements

### Planned Features
- [ ] Customizable keyboard shortcuts (user can remap)
- [ ] Shortcut for next/previous song
- [ ] Quick search (Cmd/Ctrl + K)
- [ ] Shortcut to toggle focus mode
- [ ] Vim-style navigation (j/k for up/down)
- [ ] Shortcut to skip to next Pomodoro session
- [ ] Shortcut to toggle dark mode
- [ ] Export/import keyboard shortcut preferences

### Advanced Features
- [ ] Chord shortcuts (Cmd+K, Cmd+S style)
- [ ] Context-aware shortcuts (different shortcuts per view)
- [ ] Shortcut conflicts detection
- [ ] Visual shortcut overlay (press Cmd to see all shortcuts)
- [ ] Shortcut recording (press keys to assign)
- [ ] Shortcut profiles (work, study, relax)

## API Reference

### Main Process

#### `registerKeyboardShortcuts()`
Registers all global keyboard shortcuts. Called in `app.whenReady()`.

#### `unregisterKeyboardShortcuts()`
Unregisters all shortcuts. Called in `app.on('before-quit')`.

### Preload

#### `window.electron.onKeyboardShortcut(callback)`
Listens for keyboard shortcut events.
- **Parameters**: `callback(action: string)`
- **Returns**: Unsubscribe function
- **Actions**: 'add-note', 'add-event', 'toggle-pomodoro', 'open-settings', 'show-shortcuts-help', 'toggle-music', 'volume-up', 'volume-down'

### React

#### `handleKeyboardShortcut(action: string)`
Handles keyboard shortcut actions in React.

#### `pomodoroTimerRef.current.toggleTimer()`
Toggles the Pomodoro timer via ref.

## Changelog

### v1.0.0 (October 2025)
- ✅ Initial keyboard shortcuts implementation
- ✅ Global shortcuts: Cmd/Ctrl + N, E, T, comma, slash
- ✅ Local shortcuts: Space, Up, Down
- ✅ Keyboard shortcuts help modal
- ✅ Tooltips on all interactive elements
- ✅ Platform-aware key display (Cmd vs Ctrl)
- ✅ PomodoroTimer forwardRef integration
- ✅ Proper cleanup on app quit
- ✅ Beautiful UI with keyboard icon in header

---

**All keyboard shortcuts are fully functional and documented! ⌨️**
