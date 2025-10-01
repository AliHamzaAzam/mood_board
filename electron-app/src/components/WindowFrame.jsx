import React, { useState, useEffect } from 'react';
import { Minimize2, Maximize2, X, Pin } from 'lucide-react';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electron;

export default function WindowFrame() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

  useEffect(() => {
    if (isElectron) {
      // Get initial always-on-top state
      window.electron.getAlwaysOnTop().then(setIsAlwaysOnTop);

      // Listen for changes
      window.electron.onAlwaysOnTopChanged((value) => {
        setIsAlwaysOnTop(value);
      });
    }
  }, []);

  const handleMinimize = () => {
    if (isElectron) {
      window.electron.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (isElectron) {
      window.electron.maximizeWindow();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if (isElectron) {
      window.electron.closeWindow();
    }
  };

  const handleToggleAlwaysOnTop = async () => {
    if (isElectron) {
      const newState = await window.electron.toggleAlwaysOnTop();
      setIsAlwaysOnTop(newState);
    }
  };

  if (!isElectron) {
    return null; // Don't render window frame in browser
  }

  return (
    <div className="drag-region h-8 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-4 relative z-50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-amber-900/70">🍂 September Dashboard</span>
      </div>
      
      <div className="no-drag flex items-center gap-1">
        <button
          onClick={handleToggleAlwaysOnTop}
          className={`p-1.5 rounded hover:bg-white/30 transition-colors ${
            isAlwaysOnTop ? 'text-orange-600' : 'text-amber-900/60'
          }`}
          title={isAlwaysOnTop ? 'Disable Always on Top' : 'Enable Always on Top'}
        >
          <Pin className="w-4 h-4" />
        </button>
        <button
          onClick={handleMinimize}
          className="p-1.5 rounded hover:bg-white/30 transition-colors text-amber-900/60"
          title="Minimize"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="p-1.5 rounded hover:bg-white/30 transition-colors text-amber-900/60"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 rounded hover:bg-red-500/30 transition-colors text-amber-900/60 hover:text-red-600"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
