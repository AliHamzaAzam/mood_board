import React, { useState, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function CustomTitlebar() {
  const [isMac, setIsMac] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron - more robust check
    const electronAvailable = typeof window !== 'undefined' && 
                             window.electron && 
                             typeof window.electron.minimize === 'function';
    setIsElectron(!!electronAvailable);
    
    // Detect OS
    if (typeof window !== 'undefined' && window.navigator) {
      const platform = window.navigator.platform.toLowerCase();
      setIsMac(platform.includes('mac'));
    }

    // Listen for maximize state changes
    if (electronAvailable && window.electron?.onMaximizeChange) {
      const unsubscribe = window.electron.onMaximizeChange((maximized) => {
        setIsMaximized(maximized);
      });
      return unsubscribe;
    }
  }, []);

  const handleMinimize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.electron?.minimize) {
      window.electron.minimize().catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to minimize:', err);
        }
      });
    }
  };

  const handleMaximize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.electron?.maximize) {
      window.electron.maximize().catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to maximize:', err);
        }
      });
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.electron?.close) {
      window.electron.close().catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to close:', err);
        }
      });
    }
  };

  // Don't render if not in Electron
  if (!isElectron) {
    return null;
  }

  if (isMac) {
    return (
      <div className="titlebar-mac">
        <div className="traffic-lights">
          <button 
            className="traffic-light close" 
            onClick={handleClose}
            title="Close"
          >
            <span className="symbol">×</span>
          </button>
          <button 
            className="traffic-light minimize" 
            onClick={handleMinimize}
            title="Minimize"
          >
            <span className="symbol">−</span>
          </button>
          <button 
            className="traffic-light maximize" 
            onClick={handleMaximize}
            title="Maximize"
          >
            <span className="symbol">+</span>
          </button>
        </div>
        <div className="titlebar-title">September Dashboard</div>
      </div>
    );
  }

  // Windows titlebar
  return (
    <div className="titlebar-windows">
      <div className="titlebar-title">September Dashboard</div>
      <div className="window-controls">
        <button 
          className="control-button minimize-btn" 
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button 
          className="control-button maximize-btn" 
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="2" width="7" height="7" />
              <polyline points="3,5 3,3 10,3 10,10 8,10" />
            </svg>
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
        </button>
        <button 
          className="control-button close-btn" 
          onClick={handleClose}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
