# 🚀 Quick Start Guide

## Initial Setup (5 minutes)

### 1. Install Dependencies
```bash
cd electron-app
pnpm install
```

If you don't have pnpm:
```bash
npm install -g pnpm
```

Or use npm/yarn:
```bash
npm install
# or
yarn install
```

### 2. Create Icon Assets (Optional but Recommended)

The app includes SVG icons, but PNG files work better for Electron:

**Option A: Use Online Converter**
1. Go to https://svgtopng.com/
2. Upload `assets/icon.svg` 
3. Download as 512x512 PNG
4. Save as `assets/icon.png`
5. Repeat for `assets/tray-icon.svg` (32x32)

**Option B: Use ImageMagick** (if installed)
```bash
cd assets
convert -background none icon.svg -resize 512x512 icon.png
convert -background none tray-icon.svg -resize 32x32 tray-icon.png
```

### 3. Start Development Server
```bash
pnpm run electron:dev
```

This will:
- ✅ Start Vite dev server
- ✅ Launch Electron app
- ✅ Enable hot reload
- ✅ Open DevTools

## First Launch

When you first run the app:

1. **Grant Permissions**: macOS may ask for notification permissions
2. **System Tray**: Look for the 🍂 icon in your system tray
3. **Window Controls**: Custom controls at the top (minimize/maximize/close/pin)

## Building for Production

### Quick Build (Current Platform)
```bash
pnpm run electron:build
```

### Platform-Specific Builds

**macOS**
```bash
pnpm run electron:build:mac
```
Output: `dist-electron/September Dashboard.dmg`

**Windows**
```bash
pnpm run electron:build:win
```
Output: `dist-electron/September Dashboard Setup.exe`

**Linux**
```bash
pnpm run electron:build:linux
```
Output: `dist-electron/September Dashboard.AppImage`

## Testing Before Distribution

Test the packed app without creating installers:
```bash
pnpm run pack
```

This creates a directory with the packaged app you can run directly.

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
pnpm install
```

### Vite Not Found
```bash
# Make sure all dev dependencies are installed
pnpm install --include=dev
```

### Electron Won't Launch
```bash
# Rebuild electron
pnpm rebuild electron
```

## Development Tips

### Hot Reload
- Changes to React components reload automatically
- Changes to Electron main process require restart (`Ctrl+C` then `pnpm run electron:dev`)

### DevTools
- Automatically opens in development mode
- Toggle with `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)

### Console Logs
- **Renderer process** (React): Shows in DevTools Console
- **Main process** (Electron): Shows in terminal where you ran `pnpm run electron:dev`

## File Structure Quick Reference

```
electron-app/
├── electron/
│   ├── main.js          ← Electron main process
│   └── preload.js       ← IPC bridge (DO NOT MODIFY unless needed)
├── src/
│   ├── components/
│   │   ├── SeptemberDashboard.jsx  ← Main UI
│   │   └── WindowFrame.jsx         ← Window controls
│   ├── App.jsx          ← Root component
│   └── main.jsx         ← React entry
├── assets/              ← Icons (replace with PNGs)
├── package.json         ← Scripts & dependencies
└── vite.config.js       ← Vite configuration
```

## Next Steps

1. ✅ Run `pnpm run electron:dev` to see it in action
2. 🎨 Customize colors in `SeptemberDashboard.jsx`
3. 📝 Add your own notes and events
4. 🔧 Extend functionality as needed
5. 📦 Build and share with `pnpm run electron:build`

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

---

Need help? Check the main README.md for detailed information!
