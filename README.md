# Mood Board - September Dashboard

A polished glassmorphism productivity dashboard with mood board, calendar, Pomodoro timer, and focus tools.

## 🌐 Try it Online

**[Live Web Version](https://your-app.vercel.app)** ← Try it in your browser!

## 💾 Download Desktop App

### macOS
- Download: [September Dashboard.dmg](https://github.com/azaleas/mood_board/releases/latest)
- Open the DMG file and drag the app to Applications

### Windows
- Download: [September-Dashboard-Setup.exe](https://github.com/azaleas/mood_board/releases/latest)
- Run the installer and follow the prompts

### Linux
- **AppImage**: [September-Dashboard.AppImage](https://github.com/azaleas/mood_board/releases/latest) (Universal)
- **Debian/Ubuntu**: [September-Dashboard.deb](https://github.com/azaleas/mood_board/releases/latest)
- **Snap**: [September-Dashboard.snap](https://github.com/azaleas/mood_board/releases/latest)

## ✨ Features

- 🎨 Beautiful glassmorphism UI
- ⏱️ Pomodoro Timer with statistics
- 📅 Calendar integration
- 📊 Productivity tracking
- 🎯 Focus mode
- ⌨️ Keyboard shortcuts
- 💾 Persistent state (desktop app)

## 🛠️ Development

### Prerequisites
- Node.js 20+
- pnpm

### Setup
```bash
cd electron-app
pnpm install
```

### Run Web Version
```bash
pnpm run dev
```

### Run Electron App
```bash
pnpm run electron:dev
```

### Build

**Web:**
```bash
pnpm run build:web
```

**Desktop:**
```bash
pnpm run electron:build        # All platforms
pnpm run electron:build:mac    # macOS only
pnpm run electron:build:win    # Windows only
pnpm run electron:build:linux  # Linux only
```

## 📦 Creating a Release

1. Update version in `electron-app/package.json`
2. Commit changes
3. Create and push a tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```
4. GitHub Actions will automatically build and create a release with downloadable files

## 📄 License

MIT
