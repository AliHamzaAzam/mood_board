# September Dashboard - Electron Desktop App

<div align="center">
  <h1>🍂 September Dashboard</h1>
  <p>A beautiful, functional September-themed productivity dashboard for desktop</p>
  <p>Built with Electron, React, and Tailwind CSS</p>
  
  **✅ Production Ready | 🎨 Design System Unified | 📚 Fully Documented**
</div>

---

## 🎉 Latest Updates (October 1, 2025)

### Comprehensive Cleanup & Design System Implementation Complete!

- ✅ **Unified Design System** - All components follow consistent patterns
- ✅ **Standardized Components** - 3 button types, unified cards, consistent inputs
- ✅ **Clean Codebase** - Removed backup files, optimized code quality
- ✅ **Comprehensive Documentation** - Design system guide, quick reference, visual comparisons
- ✅ **Production Ready** - Zero build warnings, zero console errors

**Documentation:**
- [`CLEANUP_SUMMARY.md`](./CLEANUP_SUMMARY.md) - Complete cleanup summary
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) - Full design system guide
- [`DESIGN_SYSTEM_QUICK_REF.md`](./DESIGN_SYSTEM_QUICK_REF.md) - Quick reference cheat sheet
- [`VISUAL_COMPARISON.md`](./VISUAL_COMPARISON.md) - Before/after visual improvements

---

## ✨ Features

### 🎨 Core Features
- **Time-of-Day Theming** - Dynamic gradients and colors that change throughout the day (morning/afternoon/sunset/night)
- **Interactive Music Player** - Play/pause, skip tracks, adjust volume, and like your favorite songs
- **Draggable Sticky Notes** - Create and organize mood notes with drag-and-drop functionality
- **Focus Tracker** - Track study hours and tasks completed with visual progress bars
- **September Calendar** - View and manage events with an interactive calendar
- **Animated Background** - Beautiful falling autumn leaves animation

### 🖥️ Desktop Features
- **Custom Window Frame** - Themed title bar with minimize/maximize/close controls
- **System Tray Integration** - Quick actions from the system tray
  - Show/hide dashboard
  - Add quick notes
  - View today's events
  - Toggle always-on-top mode
  - Enter focus mode
- **Desktop Notifications** - Get notified about:
  - Upcoming calendar events (15 minutes before)
  - New notes added
  - Events created
  - Focus mode activation
- **Always-on-Top Mode** - Pin the dashboard above other windows
- **Data Persistence** - All your data is saved automatically using electron-store

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- pnpm (or npm/yarn)

### Installation

1. Navigate to the electron-app directory:
```bash
cd electron-app
```

2. Install dependencies:
```bash
pnpm install
```

### Development

Run the app in development mode with hot reload:
```bash
pnpm run electron:dev
```

This will:
- Start the Vite dev server on port 5173
- Launch the Electron app
- Enable hot module reloading
- Open DevTools automatically

### Building for Production

#### Build for your current platform:
```bash
pnpm run electron:build
```

#### Build for specific platforms:

**Windows:**
```bash
pnpm run electron:build:win
```

**macOS:**
```bash
pnpm run electron:build:mac
```

**Linux:**
```bash
pnpm run electron:build:linux
```

The built applications will be in the `dist-electron` directory.

## 📁 Project Structure

```
electron-app/
├── electron/              # Electron main process files
│   ├── main.js           # Main process entry point
│   └── preload.js        # Preload script (IPC bridge)
├── src/                  # React application
│   ├── components/
│   │   ├── SeptemberDashboard.jsx  # Main dashboard component
│   │   └── WindowFrame.jsx         # Custom window controls
│   ├── App.jsx           # App root component
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── assets/               # Icons and images
│   ├── icon.png          # App icon
│   └── tray-icon.png     # System tray icon
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

## 🎯 Key Technologies

- **Electron** - Desktop application framework
- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **electron-store** - Simple data persistence
- **electron-builder** - Application packaging

## 🎨 Design System

### Color Palette
- **Morning**: Amber, Orange, Yellow (warm sunrise colors)
- **Afternoon**: Blue, Cyan (clear sky colors)
- **Sunset**: Orange, Pink, Purple (golden hour colors)
- **Night**: Indigo, Purple, Slate (deep evening colors)

### UI Patterns
- **Glassmorphic Cards**: `backdrop-blur-md bg-white/30`
- **Smooth Transitions**: `duration-300` to `duration-1000`
- **Hover Effects**: `hover:scale-105` on interactive elements
- **Rounded Corners**: `rounded-3xl` for major cards, `rounded-xl` for buttons

## 🔧 Configuration

### Window Settings
Located in `electron/main.js`:
- Default size: 1400x900
- Minimum size: 1200x700
- Transparent background
- Frameless window

### Data Storage
Data is automatically saved to:
- **macOS**: `~/Library/Application Support/september-dashboard/`
- **Windows**: `%APPDATA%/september-dashboard/`
- **Linux**: `~/.config/september-dashboard/`

## 🎮 Keyboard Shortcuts

Currently, the app is optimized for mouse/trackpad interaction. Keyboard shortcuts can be added in future updates:
- Space: Play/Pause music
- Arrow keys: Volume control
- Cmd/Ctrl + N: New note
- Cmd/Ctrl + E: New event

## 🐛 Troubleshooting

### App won't start in development
1. Make sure port 5173 is not in use
2. Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
3. Clear Vite cache: `rm -rf node_modules/.vite`

### Data not persisting
- Check that the app has write permissions in the config directory
- Look for errors in the DevTools console

### Notifications not working
- Grant notification permissions in your OS settings
- macOS: System Preferences > Notifications
- Windows: Settings > System > Notifications

## 📦 Distribution

### Code Signing (macOS/Windows)
For production distribution, you'll need to sign your app:

1. Get a code signing certificate
2. Add to `package.json`:
```json
"build": {
  "mac": {
    "identity": "Developer ID Application: Your Name"
  },
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

### Auto-Updates
To add auto-update functionality:
1. Install `electron-updater`: `pnpm add electron-updater`
2. Configure in `electron/main.js`
3. Set up a release server or use GitHub releases

## 🎨 Customization

### Changing Themes
Edit the `themes` object in `src/components/SeptemberDashboard.jsx`:
```javascript
const themes = {
  morning: {
    gradient: 'from-your-color-1 via-your-color-2 to-your-color-3',
    // ...
  }
}
```

### Adding New Features
The dashboard is modular and easy to extend:
1. Add state in `SeptemberDashboard.jsx`
2. Create UI components
3. Add IPC handlers in `electron/main.js` if needed
4. Update `electron/preload.js` to expose APIs

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 🌟 Credits

- Icons: [Lucide React](https://lucide.dev)
- Framework: [Electron](https://electronjs.org)
- UI: [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com)

---

Made with 🍂 and ☕ for September vibes
