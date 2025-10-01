import React from 'react';
import { Check, Cloud, CloudOff } from 'lucide-react';

export default function StatusBar({ lastSaved, isOnline = true }) {
  const formatLastSaved = (date) => {
    if (!date) return 'Not saved yet';
    
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds
    
    if (diff < 5) return 'Saved just now';
    if (diff < 60) return `Saved ${diff}s ago`;
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `Saved ${Math.floor(diff / 3600)}h ago`;
    
    return `Saved on ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9998] pointer-events-none">
      <div className="backdrop-blur-md bg-white/70 rounded-full px-4 py-2 shadow-lg border border-orange-200/50 flex items-center gap-2">
        {lastSaved ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700 font-medium">
              {formatLastSaved(lastSaved)}
            </span>
          </>
        ) : (
          <>
            {isOnline ? (
              <Cloud className="w-4 h-4 text-gray-400" />
            ) : (
              <CloudOff className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-500">
              Not saved yet
            </span>
          </>
        )}
      </div>
    </div>
  );
}
