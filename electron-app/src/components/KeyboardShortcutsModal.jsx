import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

const isElectron = typeof window !== 'undefined' && window.electron;
const isMac = isElectron ? window.electron.platform === 'darwin' : false;

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const modifierKey = isMac ? '⌘' : 'Ctrl';
  const modifierText = isMac ? 'Cmd' : 'Ctrl';

  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: [`${modifierKey}`, 'N'], description: 'Add new mood note' },
        { keys: [`${modifierKey}`, 'E'], description: 'Add new calendar event' },
        { keys: [`${modifierKey}`, 'T'], description: 'Start/pause Pomodoro timer' },
        { keys: [`${modifierKey}`, 'S'], description: 'Open statistics & analytics' },
        { keys: [`${modifierKey}`, ','], description: 'Open settings' },
        { keys: [`${modifierKey}`, '/'], description: 'Show this help' },
        { keys: [`${modifierKey}`, 'Q'], description: 'Quit app (macOS)' },
      ],
    },
    {
      category: 'Music Player',
      items: [
        { keys: ['Space'], description: 'Play/pause music' },
        { keys: ['↑'], description: 'Increase volume' },
        { keys: ['↓'], description: 'Decrease volume' },
      ],
    },
    {
      category: 'Time Control (Demo)',
      items: [
        { keys: [`${modifierKey}`, 'Shift', 'T'], description: 'Toggle time control panel' },
        { keys: ['1'], description: 'Morning preset (9 AM)' },
        { keys: ['2'], description: 'Afternoon preset (2 PM)' },
        { keys: ['3'], description: 'Sunset preset (7 PM)' },
        { keys: ['4'], description: 'Night preset (11 PM)' },
      ],
    },
    {
      category: 'Window Controls',
      items: [
        { keys: [`${modifierKey}`, 'M'], description: 'Minimize window' },
        { keys: [`${modifierKey}`, 'W'], description: 'Close window' },
        { keys: [isMac ? '⌘' : 'F11'], description: 'Toggle fullscreen' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {shortcuts.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {section.category}
              </h3>
              <div className="space-y-3">
                {section.items.map((shortcut, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Footer tip */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-orange-900">
                <strong>💡 Tip:</strong> Press <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-orange-200 rounded">
                  {modifierKey}
                </kbd> + <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-orange-200 rounded">
                  /
                </kbd> anytime to view this help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
