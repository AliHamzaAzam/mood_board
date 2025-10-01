import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Download, Upload, Trash2, Save, Sun, Moon, Palette, Clock, Bell, Settings as SettingsIcon, Zap, RotateCw } from 'lucide-react';

// Default settings
const DEFAULT_SETTINGS = {
  // Appearance
  theme: 'auto', // 'auto', 'light', 'dark'
  accentColor: 'orange', // 'orange', 'purple', 'blue', 'green', 'pink'
  fallingLeavesEnabled: true,
  fontSize: 'medium', // 'small', 'medium', 'large'
  
  // Pomodoro
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  autoStartNextSession: false,
  pomodoroSoundEnabled: true,
  
  // Notifications
  desktopNotificationsEnabled: true,
  calendarReminderTime: 5, // minutes before
  dailyMotivationTime: '09:00',
  notificationSoundEnabled: true,
  
  // Behavior
  launchOnStartup: false,
  alwaysOnTop: false,
  minimizeToTray: true,
  closeButtonMinimizes: false,
  
  // Legacy settings for backward compatibility
  soundEnabled: true,
  events: [],
  moodNotes: [],
  studyHours: 0,
  tasksCompleted: 0
};

export default function SettingsModal({ isOpen, onClose, settings, onSettingsChange, onClearAllData }) {
  // Merge incoming settings with defaults
  const [localSettings, setLocalSettings] = useState({ ...DEFAULT_SETTINGS, ...settings });
  const [activeTab, setActiveTab] = useState('appearance');

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings({ ...DEFAULT_SETTINGS, ...settings });
  }, [settings]);

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings({ ...DEFAULT_SETTINGS, ...settings });
  }, [settings]);

  if (!isOpen) return null;

  // Update a setting
  const updateSetting = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    
    // Save to electron-store if available
    if (typeof window !== 'undefined' && window.electron?.store) {
      window.electron.store.set(`settings.${key}`, value);
    }
  };

  // Handle toggle switches
  const handleToggle = (key) => {
    updateSetting(key, !localSettings[key]);
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setLocalSettings(DEFAULT_SETTINGS);
      onSettingsChange(DEFAULT_SETTINGS);
      
      // Clear all settings from electron-store
      if (typeof window !== 'undefined' && window.electron?.store) {
        Object.keys(DEFAULT_SETTINGS).forEach(key => {
          window.electron.store.set(`settings.${key}`, DEFAULT_SETTINGS[key]);
        });
      }
      
      // Show notification
      if (typeof window !== 'undefined' && window.electron?.sendNotification) {
        window.electron.sendNotification({
          title: '✨ Settings Reset',
          body: 'All settings have been restored to defaults.'
        }).catch(() => {});
      }
    }
  };

  // Legacy functions for backward compatibility
  const handleSoundToggle = () => {
    handleToggle('soundEnabled');
  };

  const handleExportData = () => {
    const data = {
      events: settings.events || [],
      moodNotes: settings.moodNotes || [],
      studyHours: settings.studyHours || 0,
      tasksCompleted: settings.tasksCompleted || 0,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `september-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show notification
    if (typeof window !== 'undefined' && window.electron?.sendNotification) {
      window.electron.sendNotification({
        title: '📥 Data Exported',
        body: 'Your dashboard data has been exported successfully!'
      }).catch(() => {});
    }
  };

  const handleExportCalendar = () => {
    const events = settings.events || [];
    
    // Create ICS file content
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//September Dashboard//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:September Dashboard Events
X-WR-TIMEZONE:UTC
`;

    events.forEach(event => {
      const date = new Date(event.date);
      const [hours, minutes] = event.time.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
      
      const dtstart = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtend = new Date(date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      icsContent += `BEGIN:VEVENT
UID:${event.id}@september-dashboard
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${event.title}
DESCRIPTION:Event from September Dashboard
STATUS:CONFIRMED
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `september-events-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show notification
    if (typeof window !== 'undefined' && window.electron?.sendNotification) {
      window.electron.sendNotification({
        title: '📅 Calendar Exported',
        body: 'Your events have been exported as ICS file!'
      }).catch(() => {});
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            onSettingsChange({
              ...localSettings,
              events: data.events || [],
              moodNotes: data.moodNotes || [],
              studyHours: data.studyHours || 0,
              tasksCompleted: data.tasksCompleted || 0
            });
            
            // Show notification
            if (typeof window !== 'undefined' && window.electron?.sendNotification) {
              window.electron.sendNotification({
                title: '📤 Data Imported',
                body: 'Your dashboard data has been imported successfully!'
              }).catch(() => {});
            }
          } catch (error) {
            alert('Error importing data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearAllData = async () => {
    // Use the prop function if provided (for complete data clearing)
    if (onClearAllData) {
      await onClearAllData();
    } else {
      // Fallback to old behavior
      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        onSettingsChange({
          ...localSettings,
          events: [],
          moodNotes: [],
          studyHours: 0,
          tasksCompleted: 0
        });
        
        // Show notification
        if (typeof window !== 'undefined' && window.electron?.sendNotification) {
          window.electron.sendNotification({
            title: '🗑️ Data Cleared',
            body: 'All dashboard data has been cleared.'
          }).catch(() => {});
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border-t-2 sm:border-2 border-orange-200 animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 p-6 border-b-2 border-orange-300 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all hover:rotate-90 duration-300"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row overflow-hidden" style={{ height: 'calc(90vh - 100px)', maxHeight: '700px' }}>
          {/* Sidebar Tabs */}
          <div className="sm:w-56 bg-gradient-to-b from-orange-50 to-amber-50 border-r border-orange-200 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {[
                { id: 'appearance', icon: Palette, label: 'Appearance' },
                { id: 'pomodoro', icon: Clock, label: 'Pomodoro' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'behavior', icon: Zap, label: 'Behavior' },
                { id: 'data', icon: Save, label: 'Data Management' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '100%' }}>
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-orange-600" />
                    Appearance Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Customize the look and feel of your dashboard</p>
                </div>

                {/* Theme */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <label className="block text-gray-700 font-semibold mb-1">Theme</label>
                  <p className="text-xs text-gray-500 mb-3">Dashboard automatically changes theme based on time of day</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'auto', icon: Sun, label: 'Auto' },
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' }
                    ].map(theme => (
                      <button
                        key={theme.value}
                        onClick={() => updateSetting('theme', theme.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          localSettings.theme === theme.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-300 opacity-50'
                        }`}
                        title="Time-based theme switching active - manual theme coming soon!"
                      >
                        <theme.icon className={`w-6 h-6 ${localSettings.theme === theme.value ? 'text-orange-600' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <label className="block text-gray-700 font-semibold mb-1">Accent Color</label>
                  <p className="text-xs text-gray-500 mb-3">Color automatically adapts to time of day theme</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'orange', color: 'bg-orange-500' },
                      { value: 'purple', color: 'bg-purple-500' },
                      { value: 'blue', color: 'bg-blue-500' },
                      { value: 'green', color: 'bg-green-500' },
                      { value: 'pink', color: 'bg-pink-500' }
                    ].map(accent => (
                      <button
                        key={accent.value}
                        onClick={() => updateSetting('accentColor', accent.value)}
                        className={`w-12 h-12 rounded-full ${accent.color} transition-all opacity-50 ${
                          localSettings.accentColor === accent.value
                            ? 'ring-4 ring-offset-2 ring-gray-400 scale-110'
                            : 'hover:scale-105'
                        }`}
                        title="Custom accent colors coming soon!"
                      />
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <label className="block text-gray-700 font-semibold mb-3">Font Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' }
                    ].map(size => (
                      <button
                        key={size.value}
                        onClick={() => updateSetting('fontSize', size.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          localSettings.fontSize === size.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        <span className={`font-medium ${
                          size.value === 'small' ? 'text-sm' :
                          size.value === 'large' ? 'text-lg' : 'text-base'
                        }`}>{size.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Falling Leaves Animation */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Falling Leaves Animation</p>
                      <p className="text-sm text-gray-500">Show animated leaves in the background</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.fallingLeavesEnabled}
                      onChange={() => handleToggle('fallingLeavesEnabled')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pomodoro Tab */}
            {activeTab === 'pomodoro' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Pomodoro Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Configure your focus and break timers</p>
                </div>

                {/* Work Duration */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <label className="block text-gray-700 font-semibold mb-3">Work Duration</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[15, 25, 30, 45].map(duration => (
                      <button
                        key={duration}
                        onClick={() => updateSetting('workDuration', duration)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          localSettings.workDuration === duration
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        <span className="font-medium">{duration} min</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Break Duration */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <label className="block text-gray-700 font-semibold mb-3">Break Duration</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 15].map(duration => (
                      <button
                        key={duration}
                        onClick={() => updateSetting('breakDuration', duration)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          localSettings.breakDuration === duration
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        <span className="font-medium">{duration} min</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Long Break Duration */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <label className="block text-gray-700 font-semibold mb-3">Long Break Duration</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[15, 20, 30].map(duration => (
                      <button
                        key={duration}
                        onClick={() => updateSetting('longBreakDuration', duration)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          localSettings.longBreakDuration === duration
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        <span className="font-medium">{duration} min</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-start Next Session */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Auto-start Next Session</p>
                      <p className="text-sm text-gray-500">Automatically start the next session after break</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.autoStartNextSession}
                      onChange={() => handleToggle('autoStartNextSession')}
                    />
                  </div>
                </div>

                {/* Sound Notifications */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Sound Notifications</p>
                      <p className="text-sm text-gray-500">Play sound when timer completes</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.pomodoroSoundEnabled}
                      onChange={() => handleToggle('pomodoroSoundEnabled')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    Notification Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Manage how and when you receive notifications</p>
                </div>

                {/* Desktop Notifications */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Desktop Notifications</p>
                      <p className="text-sm text-gray-500">Show system notifications for events and timers</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.desktopNotificationsEnabled}
                      onChange={() => handleToggle('desktopNotificationsEnabled')}
                    />
                  </div>
                </div>

                {/* Calendar Reminder Time */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <label className="block text-gray-700 font-semibold mb-3">Calendar Event Reminder</label>
                  <p className="text-sm text-gray-500 mb-3">Remind me before events</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 15].map(minutes => (
                      <button
                        key={minutes}
                        onClick={() => updateSetting('calendarReminderTime', minutes)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          localSettings.calendarReminderTime === minutes
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        <span className="font-medium">{minutes} min</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Motivation Time */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <label className="block text-gray-700 font-semibold mb-3">Daily Motivation Time</label>
                  <p className="text-sm text-gray-500 mb-3">When should you receive daily motivation?</p>
                  <input
                    type="time"
                    value={localSettings.dailyMotivationTime}
                    onChange={(e) => updateSetting('dailyMotivationTime', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Notification Sound */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Notification Sound</p>
                      <p className="text-sm text-gray-500">Play sound with notifications</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.notificationSoundEnabled}
                      onChange={() => handleToggle('notificationSoundEnabled')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Behavior Tab */}
            {activeTab === 'behavior' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Behavior Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Configure app behavior and system integration</p>
                </div>

                {/* Launch on Startup */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Launch on Startup</p>
                      <p className="text-sm text-gray-500">Start app when your computer starts</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.launchOnStartup}
                      onChange={() => handleToggle('launchOnStartup')}
                    />
                  </div>
                </div>

                {/* Always on Top */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Always on Top</p>
                      <p className="text-sm text-gray-500">Keep window above other applications</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.alwaysOnTop}
                      onChange={() => handleToggle('alwaysOnTop')}
                    />
                  </div>
                </div>

                {/* Minimize to Tray */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Minimize to System Tray</p>
                      <p className="text-sm text-gray-500">Hide in system tray instead of taskbar</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.minimizeToTray}
                      onChange={() => handleToggle('minimizeToTray')}
                    />
                  </div>
                </div>

                {/* Close Button Behavior */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Close Button Minimizes</p>
                      <p className="text-sm text-gray-500">Minimize to tray instead of quitting</p>
                    </div>
                    <ToggleSwitch
                      checked={localSettings.closeButtonMinimizes}
                      onChange={() => handleToggle('closeButtonMinimizes')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Save className="w-5 h-5 text-orange-600" />
                    Data Management
                  </h3>
                  <p className="text-gray-600 mb-6">Import, export, and manage your data</p>
                </div>

                {/* Export Data */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Export Dashboard Data</p>
                      <p className="text-sm text-gray-500">Save all your events, notes, and progress</p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Export Calendar */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Export Calendar Events</p>
                      <p className="text-sm text-gray-500">Download as ICS file for other calendars</p>
                    </div>
                    <button
                      onClick={handleExportCalendar}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Export ICS
                    </button>
                  </div>
                </div>

                {/* Import Data */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Import Dashboard Data</p>
                      <p className="text-sm text-gray-500">Restore from a previous export</p>
                    </div>
                    <button
                      onClick={handleImportData}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Import
                    </button>
                  </div>
                </div>

                {/* Clear All Data */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-200 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-semibold">Clear All Data</p>
                      <p className="text-sm text-red-500">⚠️ This action cannot be undone</p>
                    </div>
                    <button
                      onClick={handleClearAllData}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Reset Button */}
        <div className="sticky bottom-0 bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-t-2 border-orange-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Changes are saved automatically
          </p>
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all"
          >
            <RotateCw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
        checked ? 'bg-orange-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
