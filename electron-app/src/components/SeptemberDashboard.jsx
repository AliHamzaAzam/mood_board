import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Cloud, CloudRain, Sun, Moon, Star, Music, Calendar, Plus, X, Play, Pause, SkipForward, Volume2, Heart, Coffee, BookOpen, Sparkles, Palette, RotateCw, Maximize2, Edit3, Trash2, Undo, Redo, Settings, ChevronLeft, ChevronRight, Bell, Keyboard, BarChart3, Clock, ChevronUp, ChevronDown, Watch, Search } from 'lucide-react';
import PomodoroTimer from './PomodoroTimer';
import SettingsModal from './SettingsModal';
import CelebrationAnimation from './CelebrationAnimation';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import StatisticsView from './StatisticsView';
import StatusBar from './StatusBar';
import { usePersistedState, usePersistenceManager } from '../hooks/usePersistedState';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electron;

// ============================================================================
// UNIFIED DESIGN SYSTEM
// ============================================================================
const DESIGN_SYSTEM = {
  colors: {
    // Time-of-Day Themes
    morning: {
      gradient: 'from-amber-200 via-orange-200 to-yellow-100',
      primary: '#f59e0b', // amber-500
      text: '#78350f', // amber-900
      accent: '#fb923c', // orange-400
      cardBg: 'rgba(255, 255, 255, 0.3)',
    },
    afternoon: {
      gradient: 'from-blue-300 via-cyan-200 to-blue-100',
      primary: '#3b82f6', // blue-500
      text: '#1e3a8a', // blue-900
      accent: '#60a5fa', // blue-400
      cardBg: 'rgba(255, 255, 255, 0.3)',
    },
    sunset: {
      gradient: 'from-orange-400 via-pink-300 to-purple-300',
      primary: '#f97316', // orange-500
      text: '#7c2d12', // orange-900
      accent: '#fb923c', // orange-400
      cardBg: 'rgba(255, 255, 255, 0.3)',
    },
    night: {
      gradient: 'from-indigo-900 via-purple-900 to-slate-900',
      primary: '#6366f1', // indigo-500
      text: '#e0e7ff', // indigo-100
      accent: '#818cf8', // indigo-400
      cardBg: 'rgba(255, 255, 255, 0.2)',
    },
    
    // Semantic Colors (consistent across all themes)
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
    
    // Note Colors (for mood board)
    notes: {
      yellow: '#fef3c7', // amber-100
      pink: '#fce7f3', // pink-100
      blue: '#dbeafe', // blue-100
      green: '#d1fae5', // green-100
      purple: '#ede9fe', // purple-100
    }
  },
  
  // Component-specific styles
  components: {
    card: {
      base: 'backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-2xl border border-white/40',
      hover: 'hover:scale-105 transition-transform duration-300',
    },
    button: {
      primary: 'px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105',
      secondary: 'px-4 py-2 rounded-xl font-medium bg-white/40 hover:bg-white/60 transition-colors duration-300',
      icon: 'p-2 rounded-full hover:bg-white/30 transition-colors duration-300',
    },
    input: {
      base: 'px-4 py-2 rounded-xl border-2 border-white/40 bg-white/50 focus:border-orange-500 focus:outline-none transition-colors duration-300',
    },
  },
  
  // Transitions
  transitions: {
    fast: 'duration-150',
    base: 'duration-300',
    slow: 'duration-500',
    theme: 'duration-1000', // for time-of-day changes
  }
};

const normalizeLikedSongs = (value) => {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  if (value && typeof value[Symbol.iterator] === 'function') {
    return new Set(Array.from(value));
  }
  if (typeof value === 'number') return new Set([value]);
  return new Set([0]);
};

export default function SeptemberDashboard() {
  // Persistence manager for global operations
  const { lastSaved, updateLastSaved, clearAllData } = usePersistenceManager();
  
  // Non-persisted UI state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '12:00' });
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [draggedNote, setDraggedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-yellow-200');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hoveredNote, setHoveredNote] = useState(null);
  const [rotatingNote, setRotatingNote] = useState(null);
  const [resizingNote, setResizingNote] = useState(null);
  // Precompute leaf elements with useMemo so hooks aren't called conditionally
  const leafElements = useMemo(() => {
    try {
      const leafCount = draggedNote ? 3 : 6;
      const leafEmojis = ['🍂', '🍁'];

      return [...Array(leafCount)].map((_, i) => {
        const randomLeaf = leafEmojis[i % 2];
        const leftPosition = (i * 17 + 10) % 100; // Distribute evenly
        const fontSize = 16 + (i % 3) * 4; // Vary sizes: 16, 20, 24
        const delay = i * 4; // Stagger by 4 seconds each
        const duration = 25 + (i % 3) * 5; // Vary: 25s, 30s, 35s

        return (
          <div
            key={`leaf-${i}`}
            className="absolute animate-leaf-fall"
            style={{
              left: `${leftPosition}%`,
              top: '-50px',
              fontSize: `${fontSize}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              willChange: 'transform',
              pointerEvents: 'none'
            }}
          >
            {randomLeaf}
          </div>
        );
      });
    } catch (e) {
      return null;
    }
  }, [draggedNote]);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [celebration, setCelebration] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [notificationToasts, setNotificationToasts] = useState([]);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  // Music search state
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Time override feature for theme showcasing
  const [timeOverride, setTimeOverride] = useState(null);
  const [useRealTime, setUseRealTime] = useState(true);
  const [showTimeControl, setShowTimeControl] = useState(false);
  const [timeControlExpanded, setTimeControlExpanded] = useState(true);
  const [timeControlPosition, setTimeControlPosition] = usePersistedState('timeControlPosition', { x: 20, y: 80 });
  const [isTimeTransitioning, setIsTimeTransitioning] = useState(false);
  const timeControlDragRef = useRef(null);
  const timeControlDragStartRef = useRef({ x: 0, y: 0 });
  
  // Persisted state (auto-saved with 1 second debounce)
  const [events, setEvents, eventsState] = usePersistedState('events', [
    { id: 1, date: '2024-09-15', title: 'Study Session', time: '14:00', color: 'bg-orange-500' },
    { id: 2, date: '2024-09-20', title: 'Project Due', time: '23:59', color: 'bg-red-500' },
  ]);
  
  const [moodNotes, setMoodNotes, moodNotesState] = usePersistedState('moodNotes', [
    { id: 1, text: 'Remember to review chapter 5', x: 20, y: 20, color: 'bg-yellow-200', rotation: -2, width: 200, height: 150, zIndex: 10 },
    { id: 2, text: 'Coffee at 3pm ☕', x: 60, y: 40, color: 'bg-pink-200', rotation: 3, width: 180, height: 140, zIndex: 10 },
  ]);
  
  const [studyHours, setStudyHours, studyHoursState] = usePersistedState('studyHours', 6);
  const [tasksCompleted, setTasksCompleted, tasksCompletedState] = usePersistedState('tasksCompleted', 5);
  const [dailyHoursGoal, setDailyHoursGoal, dailyHoursGoalState] = usePersistedState('dailyHoursGoal', 8);
  const [dailyTasksGoal, setDailyTasksGoal, dailyTasksGoalState] = usePersistedState('dailyTasksGoal', 10);
  const [focusStatsEditMode, setFocusStatsEditMode] = useState(false);
  const [volume, setVolume, volumeState] = usePersistedState('volume', 70);
  const [likedSongs, setLikedSongs, likedSongsState] = usePersistedState('likedSongs', new Set([0]));
  const likedSongsSet = normalizeLikedSongs(likedSongs);
  const [soundEnabled, setSoundEnabled, soundEnabledState] = usePersistedState('soundEnabled', true);
  
  const [noteHistory, setNoteHistory, noteHistoryState] = usePersistedState('noteHistory', []);
  const [historyIndex, setHistoryIndex, historyIndexState] = usePersistedState('historyIndex', -1);
  
  const [completedSessions, setCompletedSessions, completedSessionsState] = usePersistedState('completedSessions', 0);
  
  // Ensure likedSongs is always a Set (it may be loaded as an array from storage)
  useEffect(() => {
    if (!(likedSongs instanceof Set)) {
      setLikedSongs(normalizeLikedSongs(likedSongs));
    }
  }, [likedSongs, setLikedSongs]);
  
  // Settings state with defaults
  const [appSettings, setAppSettings, appSettingsState] = usePersistedState('appSettings', {
    theme: 'auto',
    accentColor: 'orange',
    fallingLeavesEnabled: true,
    fontSize: 'medium',
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    autoStartNextSession: false,
    pomodoroSoundEnabled: true,
    desktopNotificationsEnabled: true,
    calendarReminderTime: 5,
    dailyMotivationTime: '09:00',
    notificationSoundEnabled: true,
    launchOnStartup: false,
    alwaysOnTop: false,
    minimizeToTray: true,
    closeButtonMinimizes: false,
    soundEnabled: true
  });
  
  // Update last saved whenever any persisted state saves
  useEffect(() => {
    const latestSave = [
      eventsState.lastSaved,
      moodNotesState.lastSaved,
      studyHoursState.lastSaved,
      tasksCompletedState.lastSaved,
      volumeState.lastSaved,
      likedSongsState.lastSaved,
      soundEnabledState.lastSaved,
      noteHistoryState.lastSaved,
      historyIndexState.lastSaved,
      completedSessionsState.lastSaved,
      appSettingsState.lastSaved,
    ].filter(Boolean).sort((a, b) => b - a)[0];
    
    if (latestSave) {
      updateLastSaved();
    }
  }, [
    eventsState.lastSaved,
    moodNotesState.lastSaved,
    studyHoursState.lastSaved,
    tasksCompletedState.lastSaved,
    volumeState.lastSaved,
    likedSongsState.lastSaved,
    soundEnabledState.lastSaved,
    noteHistoryState.lastSaved,
    historyIndexState.lastSaved,
    completedSessionsState.lastSaved,
    appSettingsState.lastSaved,
  ]);
  
  const editInputRef = useRef(null);
  const dragStartPosRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 }); // Store offset within the note
  const isDraggingRef = useRef(false);
  const rafIdRef = useRef(null);
  const containerRef = useRef(null);
  const rotateStartXRef = useRef(0);
  const rotateStartAngleRef = useRef(0);
  const isRotatingRef = useRef(false);
  const rotateRafIdRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizeCornerRef = useRef(null);
  const isResizingRef = useRef(false);
  const resizeRafIdRef = useRef(null);
  const pomodoroTimerRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const progressIntervalRef = useRef(null);

  // Weather state
  const [weather, setWeather] = useState({
    temperature: null,
    condition: 'Loading...',
    icon: '🌤️',
    location: null,
    lastUpdated: null
  });

  // Curated YouTube lo-fi study music playlist - using state so we can add songs
  const [playlist, setPlaylist] = useState([
    { 
      title: 'Autumn Nights', 
      artist: 'Lo-fi September Mix', 
      duration: '3:45',
      videoId: 'jfKfPfyJRdk' // lofi hip hop radio - beats to relax/study to
    },
    { 
      title: 'Cozy Study Vibes', 
      artist: 'Chill Beats', 
      duration: '4:12',
      videoId: '5qap5aO4i9A' // lofi hip hop radio - beats to sleep/chill to
    },
    { 
      title: 'September Rain', 
      artist: 'Ambient Sounds', 
      duration: '3:28',
      videoId: 'lTRiuFIWV54' // Cozy Autumn Coffee Shop Ambience
    },
    {
      title: 'Focus Flow',
      artist: 'Study Session',
      duration: '3:56',
      videoId: '7NOSDKb0HlU' // Study Music - SLOW & RELAXING PIANO
    },
    {
      title: 'Midnight Study',
      artist: 'Peaceful Beats',
      duration: '4:20',
      videoId: 'DWcJFNfaw9c' // Relaxing Jazz Piano Radio
    }
  ]);
  
  // Helper function for safe notifications
  const sendNotification = async (title, body, showToast = true) => {
    if (!isElectron || !window.electron?.sendNotification) return;
    try {
      await window.electron.sendNotification({ title, body });
      if (showToast) {
        showNotificationToast(title, body);
      }
    } catch (error) {
      // Silently fail in production, notification is optional
    }
  };

  // YouTube IFrame API initialization
  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: playlist[currentSong].videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            setPlayerReady(true);
            event.target.setVolume(volume);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgressTracking();
              
              // Immediately try to get duration when video starts playing
              if (youtubePlayerRef.current) {
                const duration = youtubePlayerRef.current.getDuration();
                if (duration && duration > 0) {
                  setMusicDuration(duration);
                }
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressTracking();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              nextSong();
            }
          }
        }
      });
    };

    // If API already loaded, initialize immediately
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      stopProgressTracking();
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (playerReady && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(volume);
    }
  }, [volume, playerReady]);

  // Progress tracking
  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (youtubePlayerRef.current) {
        try {
          const current = youtubePlayerRef.current.getCurrentTime();
          const total = youtubePlayerRef.current.getDuration();
          
          if (current !== undefined && current !== null) {
            setMusicCurrentTime(current);
          }
          if (total !== undefined && total !== null) {
            setMusicDuration(total);
          }
          
          // Update playlist duration if it's still placeholder
          if (total && total > 0 && !isNaN(total)) {
            const currentVideoId = playlist[currentSong]?.videoId;
            if (currentVideoId && playlist[currentSong]?.duration === '?:??') {
              const durationStr = formatTime(total);
              setPlaylist(prev => prev.map((song, idx) => 
                idx === currentSong ? { ...song, duration: durationStr } : song
              ));
            }
          }
        } catch (error) {
          console.error('Error in progress tracking:', error);
        }
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Weather functions
  const getWeatherIcon = (code) => {
    // WMO Weather codes
    if (code === 0) return '☀️'; // Clear sky
    if (code <= 3) return '⛅'; // Partly cloudy
    if (code <= 48) return '🌫️'; // Fog
    if (code <= 67) return '🌧️'; // Rain
    if (code <= 77) return '🌨️'; // Snow
    if (code <= 82) return '🌧️'; // Rain showers
    if (code <= 86) return '🌨️'; // Snow showers
    if (code <= 99) return '⛈️'; // Thunderstorm
    return '🌤️';
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Rain Showers';
    if (code <= 86) return 'Snow Showers';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
  };

  const fetchWeather = async () => {
    try {
      // Check if running in Electron
      if (!window.electron?.fetchLocation || !window.electron?.fetchWeather) {
        throw new Error('Weather API not available');
      }

      // First, get user's location via IP (through Electron to bypass CORS)
      const locationData = await window.electron.fetchLocation();
      
      if (!locationData.latitude || !locationData.longitude) {
        throw new Error('Could not determine location');
      }

      const { latitude, longitude, city, country_name } = locationData;

      // Then fetch weather from Open-Meteo (through Electron to bypass CORS)
      const weatherData = await window.electron.fetchWeather({ latitude, longitude });

      if (weatherData.current) {
        const temp = Math.round(weatherData.current.temperature_2m);
        const code = weatherData.current.weather_code;
        
        setWeather({
          temperature: temp,
          condition: getWeatherDescription(code),
          icon: getWeatherIcon(code),
          location: `${city}, ${country_name}`,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather(prev => ({
        ...prev,
        condition: 'Unavailable',
        icon: '🌐'
      }));
    }
  };

  // Fetch weather on mount and every 30 minutes
  useEffect(() => {
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(weatherInterval);
  }, []);

  // Extract YouTube video ID from URL or return ID if already an ID
  const extractVideoId = (input) => {
    if (!input) return null;
    
    // Already a video ID (11 characters, alphanumeric)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
      return input.trim();
    }
    
    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Play video directly from URL or ID
  const playDirectVideo = async (input) => {
    const videoId = extractVideoId(input);
    
    if (!videoId) {
      // Not a valid URL/ID, proceed with search
      return false;
    }
    
    // Create temporary song entry (metadata will be updated after video loads)
    const newSong = {
      title: 'Loading...',
      artist: 'YouTube',
      duration: '?:??',
      videoId: videoId
    };
    
    // Check if song already exists in playlist
    const existingIndex = playlist.findIndex(s => s.videoId === videoId);
    
    if (existingIndex >= 0) {
      setCurrentSong(existingIndex);
    } else {
      setPlaylist(prev => [...prev, newSong]);
      setCurrentSong(playlist.length);
    }
    
    setMusicCurrentTime(0);
    setShowMusicSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    
    if (playerReady && youtubePlayerRef.current) {
      youtubePlayerRef.current.loadVideoById(videoId);
      youtubePlayerRef.current.playVideo();
      
      // Update metadata after video loads (with retry for duration)
      const updateMetadata = (attempt = 0) => {
        if (!youtubePlayerRef.current || !youtubePlayerRef.current.getVideoData) return;
        
        const videoData = youtubePlayerRef.current.getVideoData();
        const duration = youtubePlayerRef.current.getDuration();
        
        if (videoData && videoData.title) {
          const title = videoData.title;
          const artist = videoData.author || 'YouTube';
          
          // If duration is valid, update immediately
          if (duration && duration > 0 && !isNaN(duration)) {
            const durationStr = formatTime(duration);
            
            const updatedSong = {
              title: title.length > 40 ? title.substring(0, 40) + '...' : title,
              artist,
              duration: durationStr,
              videoId: videoId
            };
            
            setPlaylist(prev => prev.map((song, idx) => 
              song.videoId === videoId ? updatedSong : song
            ));
          } else if (attempt < 5) {
            // Retry if duration not ready yet (max 5 attempts)
            setTimeout(() => updateMetadata(attempt + 1), 1000);
            
            // Update title/artist now even if duration isn't ready
            const tempSong = {
              title: title.length > 40 ? title.substring(0, 40) + '...' : title,
              artist,
              duration: '?:??',
              videoId: videoId
            };
            
            setPlaylist(prev => prev.map((song, idx) => 
              song.videoId === videoId ? tempSong : song
            ));
          }
        }
      };
      
      setTimeout(() => updateMetadata(), 1500);
    }
    
    return true;
  };

  // YouTube Search Function
  const searchYouTubeMusic = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // First check if it's a direct YouTube URL or video ID
    const playedDirectly = await playDirectVideo(query);
    if (playedDirectly) {
      return; // Successfully played directly
    }

    // Otherwise proceed with search
    setIsSearching(true);
    try {
      // Using YouTube Data API v3
      const API_KEY = 'AIzaSyDxJ8yRjZ7qK7jZ8YJ8yJ8yRjZ7qK7jZ8Y'; // You'll need to add your own API key
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' music')}&type=video&videoCategoryId=10&maxResults=10&key=${API_KEY}`
      );
      
      if (!response.ok) {
        // Fallback to search without API key - using public search
        const fallbackResults = [
          {
            videoId: 'jfKfPfyJRdk',
            title: 'lofi hip hop radio - beats to relax/study to',
            artist: 'Lofi Girl',
            thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/default.jpg'
          },
          {
            videoId: '5qap5aO4i9A',
            title: 'lofi hip hop radio - beats to sleep/chill to',
            artist: 'Lofi Girl',
            thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/default.jpg'
          }
        ];
        setSearchResults(fallbackResults);
        setIsSearching(false);
        return;
      }

      const data = await response.json();
      const results = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default.url
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add song to playlist and play
  const addAndPlaySong = (song) => {
    const newSong = {
      title: song.title.length > 30 ? song.title.substring(0, 30) + '...' : song.title,
      artist: song.artist,
      duration: '?:??',
      videoId: song.videoId
    };
    
    // Check if song already exists in playlist
    const existingIndex = playlist.findIndex(s => s.videoId === song.videoId);
    
    if (existingIndex >= 0) {
      // Song exists, just play it
      setCurrentSong(existingIndex);
    } else {
      // Add new song to playlist
      setPlaylist(prev => [...prev, newSong]);
      setCurrentSong(playlist.length);
    }
    
    setMusicCurrentTime(0);
    setShowMusicSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    
    if (playerReady && youtubePlayerRef.current) {
      youtubePlayerRef.current.loadVideoById(song.videoId);
      youtubePlayerRef.current.playVideo();
    }
  };

  // Show visual toast notification
  const showNotificationToast = (title, body) => {
    const id = Date.now();
    const toast = { id, title, body };
    setNotificationToasts(prev => [...prev, toast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotificationToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Setup event listeners and tray actions on mount
  useEffect(() => {
    if (isElectron) {
      // Listen for tray actions
      window.electron.onShowNoteInput(() => {
        setShowNoteInput(true);
      });
      
      window.electron.onShowTodayEvents(() => {
        setSelectedDate(new Date());
      });
      
      window.electron.onTriggerFocusMode(() => {
        // Trigger focus mode (could show a pomodoro timer)
        sendNotification('🎯 Focus Mode Activated', 'Time to get productive!');
      });

      // Listen for keyboard shortcuts
      const unsubscribeShortcuts = window.electron.onKeyboardShortcut((action) => {
        handleKeyboardShortcut(action);
      });

      return () => {
        if (unsubscribeShortcuts) unsubscribeShortcuts();
      };
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (useRealTime) {
        setCurrentTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [useRealTime]);

  // Check for upcoming calendar events every minute and send notifications
  useEffect(() => {
    if (!isElectron) return;

    const checkUpcomingEvents = () => {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      events.forEach(event => {
        const [hours, minutes] = event.time.split(':');
        const eventDate = new Date(event.date);
        eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Check if event is exactly 5 minutes away (within a 1-minute window)
        const timeDiff = eventDate.getTime() - now.getTime();
        if (timeDiff > 4 * 60 * 1000 && timeDiff <= 5 * 60 * 1000) {
          sendNotification(
            '📅 Upcoming Event',
            `"${event.title}" starts in 5 minutes at ${event.time}`
          );
        }
      });
    };

    // Check immediately and then every minute
    checkUpcomingEvents();
    const eventChecker = setInterval(checkUpcomingEvents, 60 * 1000);
    return () => clearInterval(eventChecker);
  }, [events]);

  // Daily motivation at 9 AM
  useEffect(() => {
    if (!isElectron) return;

    const checkDailyMotivation = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Send motivation at 9:00 AM (check if we're in the 9:00-9:01 window)
      if (hour === 9 && minute === 0) {
        const motivations = [
          '🌟 Good morning! Today is full of possibilities. Let\'s make it count!',
          '☀️ Rise and shine! Your goals are waiting for you.',
          '💪 New day, new opportunities. You\'ve got this!',
          '🎯 Morning! Remember: small progress is still progress.',
          '✨ Good morning! Believe in yourself today and always.',
        ];
        const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
        sendNotification('Daily Motivation', randomMotivation);
      }
    };

    // Check immediately and then every minute
    checkDailyMotivation();
    const motivationChecker = setInterval(checkDailyMotivation, 60 * 1000);
    return () => clearInterval(motivationChecker);
  }, []);

  // Study goal completion notification (8 hours)
  useEffect(() => {
    if (!isElectron) return;
    
    // Check if user just reached or exceeded 8 hours
    if (studyHours >= 8) {
      // Use localStorage to track if we already sent this notification today
      const today = new Date().toDateString();
      const lastNotificationDate = localStorage.getItem('studyGoalNotificationDate');
      
      if (lastNotificationDate !== today) {
        sendNotification(
          '🎉 Study Goal Achieved!',
          `Congratulations! You've completed ${studyHours} hours of focused study today. Amazing work! 🌟`
        );
        localStorage.setItem('studyGoalNotificationDate', today);
      }
    }
  }, [studyHours]);

  // Handle keyboard shortcuts
  const handleKeyboardShortcut = (action) => {
    switch (action) {
      case 'add-note':
        setShowNoteInput(true);
        break;
      case 'add-event':
        setShowEventModal(true);
        setSelectedDate(new Date());
        break;
      case 'toggle-pomodoro':
        // Trigger Pomodoro toggle via ref (will be passed to PomodoroTimer)
        if (pomodoroTimerRef.current) {
          pomodoroTimerRef.current.toggleTimer();
        }
        break;
      case 'open-settings':
        setShowSettings(true);
        break;
      case 'open-statistics':
        setShowStatistics(true);
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
      case 'toggle-time-control':
        setShowTimeControl(prev => !prev);
        break;
      default:
        break;
    }
  };

  const getTimeOfDay = () => {
    const effectiveTime = useRealTime ? currentTime : (timeOverride || currentTime);
    const hour = effectiveTime.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'sunset';
    return 'night';
  };

  const timeOfDay = getTimeOfDay();

  const themes = {
    morning: {
      gradient: DESIGN_SYSTEM.colors.morning.gradient,
      icon: <Sun className="w-8 h-8 text-yellow-500" />,
      text: 'text-amber-900',
      accent: 'bg-amber-500',
    },
    afternoon: {
      gradient: DESIGN_SYSTEM.colors.afternoon.gradient,
      icon: <Cloud className="w-8 h-8 text-blue-500" />,
      text: 'text-blue-900',
      accent: 'bg-blue-500',
    },
    sunset: {
      gradient: DESIGN_SYSTEM.colors.sunset.gradient,
      icon: <CloudRain className="w-8 h-8 text-orange-600" />,
      text: 'text-orange-900',
      accent: 'bg-orange-500',
    },
    night: {
      gradient: DESIGN_SYSTEM.colors.night.gradient,
      icon: <Moon className="w-8 h-8 text-indigo-300" />,
      text: 'text-indigo-100',
      accent: 'bg-indigo-500',
    },
  };

  const quotes = {
    morning: "September mornings bring fresh starts ☕",
    afternoon: "Embrace the autumn afternoon vibes 🍂",
    sunset: "Golden hour, golden moments 🌅",
    night: "Cozy September nights are for dreaming ✨",
  };

  // YouTube Player Controls
  const togglePlay = () => {
    if (!playerReady || !youtubePlayerRef.current) {
      console.warn('Player not ready yet');
      return;
    }
    
    if (isPlaying) {
      youtubePlayerRef.current.pauseVideo();
    } else {
      youtubePlayerRef.current.playVideo();
    }
  };
  
  const nextSong = () => {
    const nextIndex = (currentSong + 1) % playlist.length;
    setCurrentSong(nextIndex);
    setMusicCurrentTime(0);
    
    if (playerReady && youtubePlayerRef.current) {
      youtubePlayerRef.current.loadVideoById(playlist[nextIndex].videoId);
      if (isPlaying) {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  const toggleLike = () => {
    setLikedSongs((prev) => {
      const baseSet = normalizeLikedSongs(prev);
      const updatedLiked = new Set(baseSet);
      if (updatedLiked.has(currentSong)) {
        updatedLiked.delete(currentSong);
      } else {
        updatedLiked.add(currentSong);
      }
      return updatedLiked;
    });
  };

  // Color options for notes
  const noteColors = [
    { name: 'Yellow', class: 'bg-yellow-200', border: 'border-yellow-400' },
    { name: 'Pink', class: 'bg-pink-200', border: 'border-pink-400' },
    { name: 'Blue', class: 'bg-blue-200', border: 'border-blue-400' },
    { name: 'Green', class: 'bg-green-200', border: 'border-green-400' },
    { name: 'Purple', class: 'bg-purple-200', border: 'border-purple-400' },
    { name: 'Orange', class: 'bg-orange-200', border: 'border-orange-400' },
    { name: 'Teal', class: 'bg-teal-200', border: 'border-teal-400' },
    { name: 'Rose', class: 'bg-rose-200', border: 'border-rose-400' },
  ];

  // Save to history for undo/redo
  const saveToHistory = (newNotes) => {
    const newHistory = noteHistory.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newNotes)));
    setNoteHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMoodNotes(JSON.parse(JSON.stringify(noteHistory[historyIndex - 1])));
    }
  };

  const addNote = () => {
    if (!newNoteText || !newNoteText.trim()) return;

    const maxZ = moodNotes.length ? Math.max(...moodNotes.map(n => n.zIndex || 0)) : 0;
    const newNote = {
      id: Date.now(),
      x: 10,
      y: 10,
      text: newNoteText,
      color: selectedColor || 'bg-yellow-200',
      rotation: 0,
      zIndex: maxZ + 1,
    };

    const newNotes = [...moodNotes, newNote];
    setMoodNotes(newNotes);
    saveToHistory(newNotes);
    setNewNoteText('');
    setShowNoteInput(false);

    // Send notification
    if (typeof sendNotification === 'function') {
      sendNotification('📝 Note Added', `${newNote.text.slice(0, 50)}${newNote.text.length > 50 ? '...' : ''}`);
    }
  };

  const deleteNote = (id) => {
    const newNotes = moodNotes.filter(note => note.id !== id);
    setMoodNotes(newNotes);
    saveToHistory(newNotes);
  };

  // Alias used by UI handlers
  const addMoodNote = () => addNote();

  const redo = () => {
    if (historyIndex < noteHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMoodNotes(JSON.parse(JSON.stringify(noteHistory[historyIndex + 1])));
    }
  };

  const updateNoteText = (id, newText) => {
    const newNotes = moodNotes.map(n => 
      n.id === id ? { ...n, text: newText } : n
    );
    setMoodNotes(newNotes);
    saveToHistory(newNotes);
    setEditingNote(null);
  };

  const changeNoteColor = (id, newColor) => {
    const newNotes = moodNotes.map(n => 
      n.id === id ? { ...n, color: newColor } : n
    );
    setMoodNotes(newNotes);
    saveToHistory(newNotes);
  };

  const rotateNote = (id) => {
    const newNotes = moodNotes.map(n => 
      n.id === id ? { ...n, rotation: (n.rotation + 15) % 360 } : n
    );
    setMoodNotes(newNotes);
    saveToHistory(newNotes);
  };

  // Optimized drag handling using refs and RAF for smooth performance
  const handleNoteDrag = useCallback((e) => {
    if (!draggedNote || !isDraggingRef.current || !containerRef.current) return;
    
    e.preventDefault();
    
    // Cancel any pending animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    // Use requestAnimationFrame for smooth updates
    rafIdRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate position accounting for where user clicked within the note
      const x = ((e.clientX - rect.left - dragOffsetRef.current.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffsetRef.current.y) / rect.height) * 100;
      
      setMoodNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === draggedNote.id 
            ? { ...n, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) } 
            : n
        )
      );
    });
  }, [draggedNote]);

  const handleDragStart = (e, note) => {
    // Don't start dragging if we're rotating, resizing, or editing
    if (editingNote || isRotatingRef.current || isResizingRef.current || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = true;
    setDraggedNote(note);
    
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const noteElement = e.currentTarget;
      const noteRect = noteElement.getBoundingClientRect();
      
      // Calculate offset from where user clicked within the note
      dragOffsetRef.current = {
        x: e.clientX - noteRect.left,
        y: e.clientY - noteRect.top
      };
      
      dragStartPosRef.current = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      };
    }
  };

  const handleDragEnd = useCallback(() => {
    if (draggedNote && isDraggingRef.current) {
      // Save to history using functional setState to get current value
      setMoodNotes(currentNotes => {
        saveToHistory(currentNotes);
        return currentNotes;
      });
      
      setDraggedNote(null);
      isDraggingRef.current = false;
      dragStartPosRef.current = null;
      dragOffsetRef.current = { x: 0, y: 0 };
      
      // Clear any pending animation frame
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }
  }, [draggedNote]);

  // Add document-level mouse event listeners when dragging
  useEffect(() => {
    if (draggedNote) {
      document.addEventListener('mousemove', handleNoteDrag);
      document.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleNoteDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggedNote, handleNoteDrag, handleDragEnd]);

  // Rotation drag handlers
  const handleRotateDrag = useCallback((e) => {
    if (!rotatingNote || !isRotatingRef.current) return;
    
    e.preventDefault();
    
    // Cancel any pending animation frame
    if (rotateRafIdRef.current) {
      cancelAnimationFrame(rotateRafIdRef.current);
    }
    
    // Use requestAnimationFrame for smooth rotation
    rotateRafIdRef.current = requestAnimationFrame(() => {
      const deltaX = e.clientX - rotateStartXRef.current;
      // Convert horizontal drag to rotation (1px = 1 degree)
      const newRotation = (rotateStartAngleRef.current + deltaX) % 360;
      const normalizedRotation = newRotation < 0 ? newRotation + 360 : newRotation;
      
      setMoodNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === rotatingNote.id 
            ? { ...n, rotation: Math.round(normalizedRotation) } 
            : n
        )
      );
    });
  }, [rotatingNote]);

  const handleRotateStart = (e, note) => {
    e.preventDefault();
    e.stopPropagation();
    
    isRotatingRef.current = true;
    setRotatingNote(note);
    rotateStartXRef.current = e.clientX;
    rotateStartAngleRef.current = note.rotation || 0;
  };

  const handleRotateEnd = useCallback(() => {
    if (rotatingNote && isRotatingRef.current) {
      // Save to history
      setMoodNotes(currentNotes => {
        saveToHistory(currentNotes);
        return currentNotes;
      });
      
      setRotatingNote(null);
      isRotatingRef.current = false;
      rotateStartXRef.current = 0;
      rotateStartAngleRef.current = 0;
      
      // Clear any pending animation frame
      if (rotateRafIdRef.current) {
        cancelAnimationFrame(rotateRafIdRef.current);
        rotateRafIdRef.current = null;
      }
    }
  }, [rotatingNote]);

  // Add document-level listeners for rotation
  useEffect(() => {
    if (rotatingNote) {
      document.addEventListener('mousemove', handleRotateDrag);
      document.addEventListener('mouseup', handleRotateEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleRotateDrag);
        document.removeEventListener('mouseup', handleRotateEnd);
      };
    }
  }, [rotatingNote, handleRotateDrag, handleRotateEnd]);

  // Resize drag handlers
  const handleResizeDrag = useCallback((e) => {
    if (!resizingNote || !isResizingRef.current || !containerRef.current) return;
    
    e.preventDefault();
    
    // Cancel any pending animation frame
    if (resizeRafIdRef.current) {
      cancelAnimationFrame(resizeRafIdRef.current);
    }
    
    // Use requestAnimationFrame for smooth resizing
    resizeRafIdRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      
      const corner = resizeCornerRef.current;
      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;
      let newX = resizeStartRef.current.noteX;
      let newY = resizeStartRef.current.noteY;
      
      // Adjust size based on corner being dragged
      if (corner.includes('right')) {
        newWidth = Math.max(120, resizeStartRef.current.width + (deltaX / rect.width) * 100);
      } else if (corner.includes('left')) {
        const widthChange = (deltaX / rect.width) * 100;
        newWidth = Math.max(120, resizeStartRef.current.width - widthChange);
        // Adjust x position to keep right edge fixed
        if (newWidth > 120) {
          newX = resizeStartRef.current.noteX + widthChange;
        }
      }
      
      if (corner.includes('bottom')) {
        newHeight = Math.max(100, resizeStartRef.current.height + (deltaY / rect.height) * 100);
      } else if (corner.includes('top')) {
        const heightChange = (deltaY / rect.height) * 100;
        newHeight = Math.max(100, resizeStartRef.current.height - heightChange);
        // Adjust y position to keep bottom edge fixed
        if (newHeight > 100) {
          newY = resizeStartRef.current.noteY + heightChange;
        }
      }
      
      setMoodNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === resizingNote.id 
            ? { ...n, width: newWidth, height: newHeight, x: newX, y: newY } 
            : n
        )
      );
    });
  }, [resizingNote]);

  const handleResizeStart = (e, note, corner) => {
    e.preventDefault();
    e.stopPropagation();
    
    isResizingRef.current = true;
    setResizingNote(note);
    resizeCornerRef.current = corner;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: note.width || 200,
      height: note.height || 150,
      noteX: note.x,
      noteY: note.y
    };
  };

  const handleResizeEnd = useCallback(() => {
    if (resizingNote && isResizingRef.current) {
      // Save to history
      setMoodNotes(currentNotes => {
        saveToHistory(currentNotes);
        return currentNotes;
      });
      
      setResizingNote(null);
      isResizingRef.current = false;
      resizeCornerRef.current = null;
      resizeStartRef.current = { x: 0, y: 0, width: 0, height: 0 };
      
      // Clear any pending animation frame
      if (resizeRafIdRef.current) {
        cancelAnimationFrame(resizeRafIdRef.current);
        resizeRafIdRef.current = null;
      }
    }
  }, [resizingNote]);

  // Add document-level listeners for resizing
  useEffect(() => {
    if (resizingNote) {
      document.addEventListener('mousemove', handleResizeDrag);
      document.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeDrag);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingNote, handleResizeDrag, handleResizeEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in an input/textarea
      const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
      
      // Space: Play/pause music (only when NOT typing)
      if (e.key === ' ' && !isTyping) {
        e.preventDefault();
        togglePlay();
      }
      
      // Delete key to remove hovered note
      if (e.key === 'Delete' && hoveredNote) {
        deleteNote(hoveredNote);
        setHoveredNote(null);
      }
      // Escape to cancel editing
      if (e.key === 'Escape' && editingNote) {
        setEditingNote(null);
      }
      // Ctrl/Cmd + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Ctrl/Cmd + S for statistics
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        setShowStatistics(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredNote, editingNote, historyIndex]);

  // Auto-focus edit input
  useEffect(() => {
    if (editingNote && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNote]);


  const getDaysInMonth = (date) => {
    const year = calendarYear;
    const month = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(selectedDate);
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const handlePreviousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const getEventsForDate = (day) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const addEvent = () => {
    if (newEvent.title.trim()) {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const eventData = {
        id: Date.now(),
        date: dateStr,
        title: newEvent.title,
        time: newEvent.time,
        color: 'bg-amber-500'
      };
      
      setEvents([...events, eventData]);
      setNewEvent({ title: '', time: '12:00' });
      setShowEventModal(false);
      
      // Schedule notification for this event
      if (isElectron) {
        const eventDateTime = `${dateStr}T${newEvent.time}`;
        window.electron.scheduleNotification({
          title: newEvent.title,
          body: newEvent.time,
          eventTime: eventDateTime
        }).catch(() => {});
        
        // Send immediate confirmation
        sendNotification('📅 Event Added', `"${newEvent.title}" on ${new Date(dateStr).toLocaleDateString()}`);
      }
    }
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // Time control functions for theme showcasing
  const setTimePreset = (hour) => {
    const newTime = new Date();
    newTime.setHours(hour, 0, 0, 0);
    setTimeOverride(newTime);
    setCurrentTime(newTime);
    setUseRealTime(false);
    setIsTimeTransitioning(true);
    setTimeout(() => setIsTimeTransitioning(false), 1000);
  };

  const setTimeBySlider = (hour) => {
    const newTime = new Date();
    newTime.setHours(hour, 0, 0, 0);
    setTimeOverride(newTime);
    setCurrentTime(newTime);
    setUseRealTime(false);
  };

  const resetToRealTime = () => {
    setUseRealTime(true);
    setTimeOverride(null);
    setCurrentTime(new Date());
    setIsTimeTransitioning(true);
    setTimeout(() => setIsTimeTransitioning(false), 1000);
  };

  const handleTimeControlDragStart = (e) => {
    timeControlDragRef.current = true;
    timeControlDragStartRef.current = {
      x: e.clientX - timeControlPosition.x,
      y: e.clientY - timeControlPosition.y
    };
  };

  const handleTimeControlDrag = (e) => {
    if (timeControlDragRef.current && e.clientX && e.clientY) {
      setTimeControlPosition({
        x: e.clientX - timeControlDragStartRef.current.x,
        y: e.clientY - timeControlDragStartRef.current.y
      });
    }
  };

  const handleTimeControlDragEnd = () => {
    timeControlDragRef.current = false;
  };

  // Add keyboard event listener for time control shortcuts
  useEffect(() => {
    const handleTimeControlKeys = (e) => {
      // Cmd/Ctrl + Shift + T to toggle time control
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 't') {
        e.preventDefault();
        setShowTimeControl(prev => !prev);
      }
      
      // Number keys 1-4 for quick presets when panel is open
      if (showTimeControl && timeControlExpanded) {
        if (e.key === '1') {
          e.preventDefault();
          setTimePreset(9); // Morning
        } else if (e.key === '2') {
          e.preventDefault();
          setTimePreset(14); // Afternoon
        } else if (e.key === '3') {
          e.preventDefault();
          setTimePreset(19); // Sunset
        } else if (e.key === '4') {
          e.preventDefault();
          setTimePreset(23); // Night
        }
      }
    };

    window.addEventListener('keydown', handleTimeControlKeys);
    return () => window.removeEventListener('keydown', handleTimeControlKeys);
  }, [showTimeControl, timeControlExpanded]);

  // Font size classes
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[timeOfDay].gradient} transition-all duration-[3000ms] p-8 relative overflow-hidden ${fontSizeClasses[appSettings.fontSize]}`}>
      {/* Time Travel Animation Overlay */}
      {isTimeTransitioning && (
        <div className="fixed inset-0 z-[9997] pointer-events-none flex items-center justify-center">
          <div className="text-8xl opacity-30 animate-spin">
            <Clock className="w-32 h-32" style={{ color: themes[timeOfDay].accent.replace('bg-', '') }} />
          </div>
        </div>
      )}

      {/* Notification Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {notificationToasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-orange-200 min-w-[320px] animate-slide-in-right"
          >
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 rounded-full p-2 animate-pulse">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{toast.title}</h4>
                <p className="text-sm text-gray-600">{toast.body}</p>
              </div>
              <button
                onClick={() => setNotificationToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Time Control Widget for Theme Showcasing */}
      {showTimeControl && (
        <div
          className="fixed z-[9998] pointer-events-auto"
          style={{
            left: `${timeControlPosition.x}px`,
            top: `${timeControlPosition.y}px`
          }}
          onMouseMove={handleTimeControlDrag}
          onMouseUp={handleTimeControlDragEnd}
          onMouseLeave={handleTimeControlDragEnd}
        >
          <div className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 ${themes[timeOfDay].accent.replace('bg-', 'border-')} overflow-hidden transition-all duration-300 ${
            timeControlExpanded ? 'w-80' : 'w-16'
          }`}>
            {/* Header - Always visible */}
            <div
              className={`${themes[timeOfDay].accent} p-3 cursor-move flex items-center justify-between`}
              onMouseDown={handleTimeControlDragStart}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white" />
                {timeControlExpanded && (
                  <span className="text-white font-semibold text-sm">Time Control</span>
                )}
              </div>
              <button
                onClick={() => setTimeControlExpanded(prev => !prev)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                {timeControlExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Content - Only when expanded */}
            {timeControlExpanded && (
              <div className="p-4 space-y-4">
                {/* Demo Mode Badge */}
                {!useRealTime && (
                  <div className="bg-orange-100 border border-orange-300 rounded-lg px-3 py-2 flex items-center gap-2 animate-pulse">
                    <Watch className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-orange-700 uppercase">Demo Mode Active</span>
                  </div>
                )}

                {/* Current Time Display */}
                <div className="text-center">
                  <div className={`text-2xl font-bold ${themes[timeOfDay].text.replace('text-', 'text-')} mb-1`}>
                    {(useRealTime ? currentTime : (timeOverride || currentTime)).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {timeOfDay} Theme {isTimeTransitioning && '(transitioning...)'}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Quick Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTimePreset(9)}
                      className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Sun className="w-4 h-4" />
                      <span>Morning</span>
                    </button>
                    <button
                      onClick={() => setTimePreset(14)}
                      className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Cloud className="w-4 h-4" />
                      <span>Afternoon</span>
                    </button>
                    <button
                      onClick={() => setTimePreset(19)}
                      className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-900 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <CloudRain className="w-4 h-4" />
                      <span>Sunset</span>
                    </button>
                    <button
                      onClick={() => setTimePreset(23)}
                      className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Moon className="w-4 h-4" />
                      <span>Night</span>
                    </button>
                  </div>
                </div>

                {/* Time Slider */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Custom Hour (0-23)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="23"
                      value={(useRealTime ? currentTime : (timeOverride || currentTime)).getHours()}
                      onChange={(e) => setTimeBySlider(parseInt(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-sm font-mono font-bold text-gray-700 w-12 text-right">
                      {(useRealTime ? currentTime : (timeOverride || currentTime)).getHours()}:00
                    </span>
                  </div>
                </div>

                {/* Use Real Time Toggle */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-sm font-medium text-gray-700">Use Real Time</span>
                  <button
                    onClick={() => {
                      if (useRealTime) {
                        // Switching to demo mode - keep current time
                        const now = new Date();
                        setTimeOverride(now);
                        setCurrentTime(now);
                        setUseRealTime(false);
                      } else {
                        // Switching back to real time
                        resetToRealTime();
                      }
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      useRealTime ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                        useRealTime ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Reset Button */}
                {!useRealTime && (
                  <button
                    onClick={resetToRealTime}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Reset to Real Time</span>
                  </button>
                )}

                {/* Keyboard Shortcuts Hint */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                  <p className="font-semibold mb-1">Keyboard Shortcuts</p>
                  <p>⌘/Ctrl + Shift + T: Toggle panel</p>
                  <p>1-4: Quick presets when open</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Weather & Time-Based Background Animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Optional autumn leaves (if enabled in settings) */}
        {appSettings.fallingLeavesEnabled && (
          <>
            {leafElements}
          </>
        )}

        {/* Clear Sky - Sun rays (morning/afternoon) */}
        {(weather.condition === 'Clear Sky' || weather.condition === 'Clear') && timeOfDay !== 'night' && (
          <div className="absolute inset-0">
            <div className="absolute top-10 right-20 w-32 h-32 animate-sun-rays">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-full blur-xl" />
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-yellow-300/30 to-transparent origin-bottom"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-40px)`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Partly Cloudy - Pixel clouds */}
        {(weather.condition?.includes('Cloud') || weather.condition?.includes('Partly')) && (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={`cloud-${i}`}
                className="absolute animate-float-cloud"
                style={{
                  top: `${10 + i * 15}%`,
                  left: '-20%',
                  animationDelay: `${i * 8}s`,
                  animationDuration: `${40 + i * 10}s`,
                  willChange: 'transform'
                }}
              >
                {/* Pixel art cloud */}
                <div className="relative opacity-20">
                  <div className="w-16 h-4 bg-white rounded-sm" />
                  <div className="w-12 h-4 bg-white rounded-sm absolute top-[-8px] left-2" />
                  <div className="w-8 h-4 bg-white rounded-sm absolute top-[-14px] left-6" />
                  <div className="w-12 h-4 bg-white rounded-sm absolute top-[-8px] left-8" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Rainy - Rain drops */}
        {(weather.condition?.includes('Rain') || weather.condition?.includes('Shower')) && (
          <>
            {[...Array(50)].map((_, i) => (
              <div
                key={`rain-${i}`}
                className="absolute w-0.5 h-8 bg-gradient-to-b from-blue-400/60 to-transparent animate-rain-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-100px',
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  willChange: 'transform'
                }}
              />
            ))}
          </>
        )}

        {/* Snowy - Snowflakes */}
        {weather.condition?.includes('Snow') && (
          <>
            {[...Array(40)].map((_, i) => (
              <div
                key={`snow-${i}`}
                className="absolute w-2 h-2 bg-white rounded-full animate-snow-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-100px',
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${5 + Math.random() * 5}s`,
                  opacity: 0.8,
                  willChange: 'transform'
                }}
              />
            ))}
          </>
        )}

        {/* Foggy - Fog layers */}
        {weather.condition?.includes('Fog') && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={`fog-${i}`}
                className="absolute w-full h-40 animate-fog-drift"
                style={{
                  top: `${i * 15}%`,
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.1 + i * 0.05}), transparent)`,
                  animationDelay: `${i * 3}s`,
                  animationDuration: `${20 + i * 5}s`,
                  filter: 'blur(20px)',
                  willChange: 'transform, opacity'
                }}
              />
            ))}
          </>
        )}

        {/* Thunderstorm - Lightning flashes + rain */}
        {weather.condition?.includes('Thunderstorm') && (
          <>
            {/* Lightning flash overlay */}
            <div className="absolute inset-0 bg-white animate-lightning" style={{ animationDuration: '8s' }} />
            
            {/* Heavy rain */}
            {[...Array(80)].map((_, i) => (
              <div
                key={`storm-rain-${i}`}
                className="absolute w-0.5 h-12 bg-gradient-to-b from-blue-300/70 to-transparent animate-rain-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-100px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.3 + Math.random() * 0.3}s`,
                  willChange: 'transform'
                }}
              />
            ))}
          </>
        )}

        {/* Night - Stars */}
        {timeOfDay === 'night' && (
          <>
            {[...Array(30)].map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full animate-star-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </>
        )}

        {/* Ambient particles for all conditions */}
        {[...Array(8)].map((_, i) => {
          const colors = {
            morning: 'rgba(251, 146, 60, 0.15)',
            afternoon: 'rgba(96, 165, 250, 0.15)',
            sunset: 'rgba(251, 146, 60, 0.2)',
            night: 'rgba(129, 140, 248, 0.1)'
          };
          return (
            <div
              key={`ambient-${i}`}
              className="absolute rounded-full animate-ambient-drift"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + i * 8}%`,
                width: `${30 + i * 15}px`,
                height: `${30 + i * 15}px`,
                background: `radial-gradient(circle, ${colors[timeOfDay]}, transparent)`,
                animationDelay: `${i * 3}s`,
                animationDuration: `${20 + i * 5}s`,
                filter: 'blur(25px)',
                willChange: 'transform'
              }}
            />
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center mb-8 ${themes[timeOfDay].text} transition-colors duration-[3000ms]`}>
          <div className="flex items-center justify-center gap-4 mb-2 relative">
            {themes[timeOfDay].icon}
            <h1 className="text-5xl font-bold">September Dashboard</h1>
            <Sparkles className="w-8 h-8 animate-pulse" />
            {/* Action Buttons */}
            <div className="absolute right-0 flex items-center gap-2">
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className={`${DESIGN_SYSTEM.components.button.secondary} p-3 hover:scale-110`}
                title={`Keyboard Shortcuts (${isElectron && window.electron.platform === 'darwin' ? 'Cmd' : 'Ctrl'}+/)`}
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowStatistics(true)}
                className={`${DESIGN_SYSTEM.components.button.secondary} p-3 hover:scale-110`}
                title="Statistics & Analytics"
                aria-label="Statistics"
              >
                <BarChart3 className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`${DESIGN_SYSTEM.components.button.secondary} p-3 hover:scale-110`}
                title={`Settings (${isElectron && window.electron.platform === 'darwin' ? 'Cmd' : 'Ctrl'}+,)`}
                aria-label="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="text-xl opacity-80">{quotes[timeOfDay]}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time & Weather Widget */}
          <div className={`${DESIGN_SYSTEM.components.card.base} ${DESIGN_SYSTEM.components.card.hover}`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h2 className={`text-lg font-semibold ${themes[timeOfDay].text}`}>Current Time</h2>
            </div>
            <div className={`text-4xl font-bold mb-2 ${themes[timeOfDay].text}`}>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className={`text-sm opacity-80 ${themes[timeOfDay].text}`}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className={themes[timeOfDay].text}>
                <div className="text-3xl font-bold">
                  {weather.temperature !== null ? `${weather.temperature}°C` : '--°C'}
                </div>
                <div className="text-sm opacity-80">{weather.condition}</div>
                {weather.location && (
                  <div className="text-xs opacity-60 mt-1">{weather.location}</div>
                )}
              </div>
              <div className="text-5xl animate-bounce">
                {weather.icon}
              </div>
            </div>
          </div>

          {/* Enhanced Music Player Widget */}
          <div className={`${DESIGN_SYSTEM.components.card.base} ${DESIGN_SYSTEM.components.card.hover}`}>
            {/* Hidden YouTube player */}
            <div id="youtube-player" style={{ display: 'none' }}></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                <h2 className={`text-lg font-semibold ${themes[timeOfDay].text}`}>September Vibes</h2>
                {!playerReady && (
                  <span className="text-xs opacity-60 bg-white/40 px-2 py-1 rounded-full">Loading...</span>
                )}
              </div>
              <button
                onClick={() => setShowMusicSearch(!showMusicSearch)}
                className={`${DESIGN_SYSTEM.components.button.icon} ${showMusicSearch ? 'bg-white/40' : ''}`}
                aria-label="Search music"
                title="Search YouTube Music"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            {showMusicSearch && (
              <div className="mb-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchYouTubeMusic(searchQuery)}
                    placeholder="Search or paste YouTube URL/ID..."
                    className={`flex-1 px-3 py-2 rounded-lg bg-white/40 backdrop-blur-sm ${themes[timeOfDay].text} placeholder-gray-500 border border-white/30 focus:border-white/60 focus:outline-none transition-colors ${DESIGN_SYSTEM.transitions.base}`}
                  />
                  <button
                    onClick={() => searchYouTubeMusic(searchQuery)}
                    disabled={isSearching}
                    className={`${DESIGN_SYSTEM.components.button.secondary} px-4`}
                  >
                    {isSearching ? '...' : 'Search'}
                  </button>
                </div>

                {/* Helper text */}
                <div className={`text-xs opacity-60 ${themes[timeOfDay].text}`}>
                  💡 Tip: Paste a YouTube URL or video ID to play directly!
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => addAndPlaySong(result)}
                        className={`w-full text-left px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all ${DESIGN_SYSTEM.transitions.base} flex items-center gap-3`}
                      >
                        <img 
                          src={result.thumbnail} 
                          alt={result.title}
                          className="w-12 h-9 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium truncate ${themes[timeOfDay].text}`}>
                            {result.title}
                          </div>
                          <div className={`text-xs opacity-70 truncate ${themes[timeOfDay].text}`}>
                            {result.artist}
                          </div>
                        </div>
                        <Play className={`w-4 h-4 flex-shrink-0 ${themes[timeOfDay].text} opacity-70`} />
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className={`text-xs text-center py-2 opacity-70 ${themes[timeOfDay].text}`}>
                    No results found. Try different keywords.
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-20 h-20 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                <Music className="w-10 h-10 text-white" />
              </div>
              <div className={themes[timeOfDay].text}>
                <div className="font-semibold text-lg">{playlist[currentSong].title}</div>
                <div className="text-sm opacity-80">{playlist[currentSong].artist}</div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-2 bg-white/40 rounded-full">
                <div 
                  className={`h-2 ${themes[timeOfDay].accent} rounded-full transition-all ${DESIGN_SYSTEM.transitions.base}`} 
                  style={{width: musicDuration > 0 ? `${(musicCurrentTime / musicDuration) * 100}%` : '0%'}}
                ></div>
              </div>
            </div>
            <div className={`flex justify-between text-xs opacity-70 mb-4 ${themes[timeOfDay].text}`}>
              <span>{formatTime(musicCurrentTime)}</span>
              <span>{formatTime(musicDuration)}</span>
            </div>

            {/* Interactive Controls */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={toggleLike}
                className={`${DESIGN_SYSTEM.components.button.icon} ${likedSongsSet.has(currentSong) ? 'text-red-500 scale-110' : themes[timeOfDay].text + ' opacity-70'} hover:scale-125`}
                aria-label="Like song"
              >
                <Heart className={`w-5 h-5 ${likedSongsSet.has(currentSong) ? 'fill-current' : ''}`} />
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className={`p-3 rounded-full ${themes[timeOfDay].accent} text-white hover:scale-110 transition-transform ${DESIGN_SYSTEM.transitions.base} shadow-lg`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  title={`${isPlaying ? 'Pause' : 'Play'} Music (Space)`}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={nextSong}
                  className={`${DESIGN_SYSTEM.components.button.icon} ${themes[timeOfDay].text} opacity-70 hover:scale-110`}
                  aria-label="Next song"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              <button 
                className={`${DESIGN_SYSTEM.components.button.icon} ${themes[timeOfDay].text} opacity-70 hover:scale-110`} 
                aria-label="Volume"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className={`w-4 h-4 ${themes[timeOfDay].text} opacity-70`} />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/40 rounded-full appearance-none cursor-pointer"
                title="Volume Control (↑/↓ Arrow Keys)"
                style={{
                  background: `linear-gradient(to right, rgb(249 115 22) 0%, rgb(249 115 22) ${volume}%, rgba(255,255,255,0.4) ${volume}%, rgba(255,255,255,0.4) 100%)`
                }}
                aria-label="Volume"
              />
              <span className={`text-xs ${themes[timeOfDay].text} opacity-70 w-8`}>{volume}%</span>
            </div>
          </div>

          {/* Interactive Focus Stats */}
          <div className={`${DESIGN_SYSTEM.components.card.base} ${DESIGN_SYSTEM.components.card.hover}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <h2 className={`text-lg font-semibold ${themes[timeOfDay].text}`}>Today's Focus</h2>
              </div>
              <button
                onClick={() => setFocusStatsEditMode(!focusStatsEditMode)}
                className={`${DESIGN_SYSTEM.components.button.icon} ${focusStatsEditMode ? 'bg-white/40' : ''}`}
                aria-label="Toggle edit mode"
                title={focusStatsEditMode ? 'View mode' : 'Edit mode'}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className={`text-sm mb-1 flex justify-between ${themes[timeOfDay].text}`}>
                  <span>Study Hours</span>
                  <button
                    onClick={() => setStudyHours(Math.min(dailyHoursGoal, studyHours + 1))}
                    className={`text-xs ${DESIGN_SYSTEM.components.button.secondary}`}
                    aria-label="Increment study hours"
                  >
                    +1 hour
                  </button>
                </div>
                <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-2 ${themes[timeOfDay].accent} rounded-full transition-all ${DESIGN_SYSTEM.transitions.slow}`}
                    style={{width: `${Math.min(100, (studyHours / dailyHoursGoal) * 100)}%`}}
                  ></div>
                </div>
                <div className={`text-xs mt-1 opacity-70 ${themes[timeOfDay].text} flex justify-between items-center`}>
                  <span>{studyHours} of {focusStatsEditMode ? (
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={dailyHoursGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setDailyHoursGoal(Math.max(1, Math.min(24, val)));
                      }}
                      className="w-12 text-center bg-white/40 rounded px-1 border border-white/50 focus:border-white/80 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : dailyHoursGoal} hours</span>
                </div>
              </div>
              <div>
                <div className={`text-sm mb-1 flex justify-between ${themes[timeOfDay].text}`}>
                  <span>Tasks Completed</span>
                  <button
                    onClick={() => setTasksCompleted(Math.min(dailyTasksGoal, tasksCompleted + 1))}
                    className={`text-xs ${DESIGN_SYSTEM.components.button.secondary}`}
                    aria-label="Increment tasks completed"
                  >
                    +1 task
                  </button>
                </div>
                <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-2 bg-blue-500 rounded-full transition-all ${DESIGN_SYSTEM.transitions.slow}`}
                    style={{width: `${Math.min(100, (tasksCompleted / dailyTasksGoal) * 100)}%`}}
                  ></div>
                </div>
                <div className={`text-xs mt-1 opacity-70 ${themes[timeOfDay].text} flex justify-between items-center`}>
                  <span>{tasksCompleted} of {focusStatsEditMode ? (
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={dailyTasksGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setDailyTasksGoal(Math.max(1, Math.min(100, val)));
                      }}
                      className="w-12 text-center bg-white/40 rounded px-1 border border-white/50 focus:border-white/80 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : dailyTasksGoal} tasks</span>
                </div>
              </div>
              <div className={`text-center mt-4 p-3 rounded-xl bg-white/20 ${themes[timeOfDay].text} hover:bg-white/30 transition-colors ${DESIGN_SYSTEM.transitions.base} cursor-pointer`}
                onClick={() => {
                  if (studyHours >= dailyHoursGoal && tasksCompleted >= dailyTasksGoal) {
                    setCelebration(Date.now());
                  }
                }}
              >
                <div className="text-2xl font-bold">🍂 {studyHours + tasksCompleted}</div>
                <div className="text-xs opacity-80">September Leaves Earned</div>
                {studyHours >= dailyHoursGoal && tasksCompleted >= dailyTasksGoal && (
                  <div className="text-xs mt-1 text-green-600 font-semibold animate-pulse">Click to celebrate! 🎉</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Pomodoro Timer Section */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PomodoroTimer 
            ref={pomodoroTimerRef}
            soundEnabled={appSettings.pomodoroSoundEnabled}
            workDuration={appSettings.workDuration}
            breakDuration={appSettings.breakDuration}
            longBreakDuration={appSettings.longBreakDuration}
            autoStartNext={appSettings.autoStartNextSession}
            onAutoStartChange={(value) => {
              setAppSettings(prev => ({ ...prev, autoStartNextSession: value }));
            }}
            onSessionComplete={(type) => {
              if (type === 'work') {
                setStudyHours(Math.min(8, studyHours + 0.5));
                setCelebration(Date.now());
              }
            }}
          />
        
          {/* Quick Actions */}
          <div className={`${DESIGN_SYSTEM.components.card.base} ${DESIGN_SYSTEM.components.card.hover}`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className={`text-lg font-semibold ${themes[timeOfDay].text}`}>Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setShowNoteInput(true)}
                className="w-full backdrop-blur-sm bg-gradient-to-r from-yellow-400/80 to-orange-400/80 hover:from-yellow-400 hover:to-orange-400 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
                title={`Add Mood Note (${isElectron && window.electron.platform === 'darwin' ? 'Cmd' : 'Ctrl'}+N)`}
              >
                <Plus className="w-5 h-5" />
                Add Mood Note
              </button>
              <button
                onClick={() => setShowEventModal(true)}
                className="w-full backdrop-blur-sm bg-gradient-to-r from-blue-400/80 to-purple-400/80 hover:from-blue-400 hover:to-purple-400 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
                title={`Add Calendar Event (${isElectron && window.electron.platform === 'darwin' ? 'Cmd' : 'Ctrl'}+E)`}
              >
                <Calendar className="w-5 h-5" />
                Add Calendar Event
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-full backdrop-blur-sm bg-gradient-to-r from-gray-400/80 to-gray-500/80 hover:from-gray-500 hover:to-gray-600 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
                title={`Open Settings (${isElectron && window.electron.platform === 'darwin' ? 'Cmd' : 'Ctrl'}+,)`}
              >
                <Settings className="w-5 h-5" />
                Open Settings
              </button>
              <button
                onClick={() => {
                  sendNotification('🎯 Focus Mode', 'You\'ve got this! Stay focused.');
                  setCelebration(Date.now());
                }}
                className="w-full backdrop-blur-sm bg-gradient-to-r from-green-400/80 to-emerald-400/80 hover:from-green-400 hover:to-emerald-400 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
              >
                <Coffee className="w-5 h-5" />
                Motivate Me!
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Interactive Mood Board Section */}
        <div className={`mt-6 ${DESIGN_SYSTEM.components.card.base}`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6" />
              <h2 className={`text-2xl font-bold ${themes[timeOfDay].text}`}>Interactive Mood Board</h2>
              <span className={`text-xs px-2 py-1 rounded-full bg-white/30 ${themes[timeOfDay].text}`}>
                {moodNotes.length} notes
              </span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Undo/Redo */}
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`${DESIGN_SYSTEM.components.button.icon} ${historyIndex <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'} ${themes[timeOfDay].text}`}
                title="Undo (Cmd/Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= noteHistory.length - 1}
                className={`${DESIGN_SYSTEM.components.button.icon} ${historyIndex >= noteHistory.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'} ${themes[timeOfDay].text}`}
                title="Redo (Cmd/Ctrl+Shift+Z)"
                aria-label="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-white/30"></div>
              
              {/* Color Picker Toggle */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`${DESIGN_SYSTEM.components.button.icon} hover:scale-110 ${themes[timeOfDay].text}`}
                title="Choose note color"
                aria-label="Color picker"
              >
                <Palette className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className={`${DESIGN_SYSTEM.components.button.primary} ${themes[timeOfDay].accent} text-white shadow-lg flex items-center gap-2`}
                aria-label="Add note"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>
          </div>

          {/* Color Picker */}
          {showColorPicker && (
            <div className="mb-4 animate-slide-down">
              <p className={`text-sm mb-2 ${themes[timeOfDay].text} opacity-80`}>Choose note color:</p>
              <div className="flex gap-2 flex-wrap">
                {noteColors.map((colorOption) => (
                  <button
                    key={colorOption.class}
                    onClick={() => {
                      setSelectedColor(colorOption.class);
                      setShowColorPicker(false);
                    }}
                    className={`w-10 h-10 rounded-lg ${colorOption.class} border-2 ${
                      selectedColor === colorOption.class ? colorOption.border + ' scale-110' : 'border-transparent'
                    } hover:scale-110 transition-all shadow-md`}
                    title={colorOption.name}
                    aria-label={`Select ${colorOption.name} color`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add Note Input */}
          {showNoteInput && (
            <div className="mb-4 animate-slide-down">
              <div className="flex gap-2">
                <div className={`w-8 h-8 rounded-lg ${selectedColor} border-2 border-white/40 flex-shrink-0 self-center`}></div>
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMoodNote()}
                  placeholder="What's on your mind? (Press Enter to add)"
                  className={DESIGN_SYSTEM.components.input.base + ' flex-1'}
                  autoFocus
                  aria-label="New note text"
                />
                <button
                  onClick={addMoodNote}
                  className={`${DESIGN_SYSTEM.components.button.primary} ${themes[timeOfDay].accent} text-white`}
                >
                  Add
                </button>
              </div>
              <p className={`text-xs mt-2 ${themes[timeOfDay].text} opacity-60`}>
                💡 Tip: Drag bottom-right corner to resize • Hold rotate and drag to spin • Click ✏️ or double-click to edit
              </p>
            </div>
          )}

          {/* Interactive Note Board */}
          <div 
            ref={containerRef}
            className="relative min-h-96 bg-white/20 rounded-2xl p-4 overflow-hidden select-none"
          >
            {moodNotes.map(note => (
              <div
                key={note.id}
                className={`absolute ${note.color} p-4 rounded-lg shadow-xl hover:shadow-2xl transition-shadow group ${
                  draggedNote?.id === note.id ? 'scale-110 cursor-grabbing' : 
                  rotatingNote?.id === note.id ? 'scale-105 ring-4 ring-blue-400' :
                  resizingNote?.id === note.id ? 'ring-4 ring-purple-400' :
                  'cursor-grab'
                } ${hoveredNote === note.id ? 'ring-2 ring-orange-400' : ''} ${
                  editingNote === note.id ? 'cursor-text' : ''
                }`}
                style={{ 
                  left: `${note.x}%`, 
                  top: `${note.y}%`,
                  transform: `rotate(${note.rotation || 0}deg)`,
                  width: note.width || 200,
                  minHeight: note.height || 150,
                  maxWidth: '350px',
                  zIndex: note.zIndex || 10,
                  userSelect: editingNote === note.id ? 'text' : 'none',
                  transition: (draggedNote?.id === note.id || rotatingNote?.id === note.id || resizingNote?.id === note.id) ? 'none' : 'transform 0.2s ease-out, box-shadow 0.2s ease-out'
                }}
                onMouseDown={(e) => handleDragStart(e, note)}
                onMouseEnter={() => setHoveredNote(note.id)}
                onMouseLeave={() => setHoveredNote(null)}
                onDoubleClick={(e) => {
                  if (e.target.tagName !== 'BUTTON') {
                    e.preventDefault();
                    setEditingNote(note.id);
                    setEditText(note.text);
                  }
                }}
              >
                {/* Action Buttons */}
                <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingNote(note.id);
                      setEditText(note.text);
                    }}
                    className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-600 shadow-lg hover:scale-110 transition-all"
                    title="Edit note (or double-click)"
                    aria-label="Edit note"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onMouseDown={(e) => handleRotateStart(e, note)}
                    className={`w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 shadow-lg hover:scale-110 transition-all ${
                      rotatingNote?.id === note.id ? 'scale-125 ring-2 ring-blue-300' : ''
                    }`}
                    title="Click and drag to rotate"
                    aria-label="Rotate note"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-lg hover:scale-110 transition-all"
                    title="Delete note (or press Delete key)"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Resize Handle - Bottom Right Only */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                  {/* Bottom-right */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, note, 'bottom-right')}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-purple-500 rounded-full cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform shadow-lg"
                  />
                </div>

                {/* Color Swatches */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {noteColors.slice(0, 5).map((colorOption) => (
                    <button
                      key={colorOption.class}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        changeNoteColor(note.id, colorOption.class);
                      }}
                      className={`w-5 h-5 rounded-full ${colorOption.class} border-2 border-white shadow-md hover:scale-125 transition-all ${
                        note.color === colorOption.class ? 'ring-2 ring-orange-400' : ''
                      }`}
                      title={`Change to ${colorOption.name}`}
                      aria-label={`Change to ${colorOption.name}`}
                    />
                  ))}
                </div>

                {/* Note Content - Editable */}
                {editingNote === note.id ? (
                  <textarea
                    ref={editInputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent drag when editing
                    onBlur={() => {
                      updateNoteText(note.id, editText);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        updateNoteText(note.id, editText);
                      }
                      if (e.key === 'Escape') {
                        setEditingNote(null);
                      }
                    }}
                    className="w-full h-full bg-transparent text-sm text-gray-800 font-medium resize-none focus:outline-none select-text"
                    style={{ minHeight: '100px', userSelect: 'text' }}
                  />
                ) : (
                  <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap break-words select-none pointer-events-none">
                    {note.text}
                  </p>
                )}
              </div>
            ))}
            
            {/* Empty State */}
            {moodNotes.length === 0 && (
              <div className={`text-center py-20 ${themes[timeOfDay].text} opacity-50`}>
                <BookOpen className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-semibold">Add your first sticky note!</p>
                <p className="text-sm mt-2">Click "Add Note" to get started</p>
              </div>
            )}

            {/* Keyboard Shortcuts Help */}
            {moodNotes.length > 0 && (
              <div className={`absolute bottom-2 right-2 text-xs ${themes[timeOfDay].text} opacity-30 hover:opacity-80 transition-opacity bg-white/50 px-3 py-2 rounded-lg`}>
                <div className="font-semibold mb-1">⌨️ Shortcuts & Tips:</div>
                <div>🖱️ Drag note to move position</div>
                <div>📐 Drag bottom-right corner to resize</div>
                <div>🔄 Hold rotate button + drag to spin</div>
                <div>✏️ Click green button or double-click to edit</div>
                <div>⌫ Delete: Remove hovered note</div>
                <div>⌘/Ctrl+Z: Undo | ⌘/Ctrl+Shift+Z: Redo</div>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Section */}
        <div className={`mt-6 ${DESIGN_SYSTEM.components.card.base}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                <h2 className={`text-2xl font-bold ${themes[timeOfDay].text}`}>
                  {monthNames[calendarMonth]} {calendarYear}
                </h2>
              </div>
              {/* Month/Year Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className={`${DESIGN_SYSTEM.components.button.secondary} hover:scale-110`}
                  title="Previous month"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className={`${DESIGN_SYSTEM.components.button.secondary} hover:scale-110`}
                  title="Next month"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowEventModal(true)}
              className={`${DESIGN_SYSTEM.components.button.primary} ${themes[timeOfDay].accent} text-white shadow-lg flex items-center gap-2`}
              aria-label="Add event"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`text-center font-semibold text-sm ${themes[timeOfDay].text} opacity-70`}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day === currentTime.getDate() && 
                             selectedDate.getMonth() === currentTime.getMonth() &&
                             selectedDate.getFullYear() === currentTime.getFullYear();
              
              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                  className={`aspect-square p-2 rounded-xl cursor-pointer transition-all ${DESIGN_SYSTEM.transitions.base} hover:scale-105 ${
                    day 
                      ? isToday 
                        ? `${themes[timeOfDay].accent} text-white shadow-lg scale-105` 
                        : `${DESIGN_SYSTEM.components.button.secondary}`
                      : 'bg-transparent'
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-semibold ${isToday ? 'text-white' : themes[timeOfDay].text}`}>
                        {day}
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {dayEvents.slice(0, 2).map(event => (
                          <div key={event.id} className={`w-1.5 h-1.5 rounded-full ${event.color}`}></div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Events List */}
          <div className="mt-6">
            <h3 className={`text-lg font-semibold mb-3 ${themes[timeOfDay].text}`}>
              Events for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-2">
              {getEventsForDate(selectedDate.getDate()).length > 0 ? (
                getEventsForDate(selectedDate.getDate()).map(event => (
                  <div key={event.id} className={`flex items-center justify-between p-3 ${DESIGN_SYSTEM.components.button.secondary}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                      <div>
                        <div className={`font-semibold ${themes[timeOfDay].text}`}>{event.title}</div>
                        <div className={`text-sm opacity-70 ${themes[timeOfDay].text}`}>{event.time}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform"
                      aria-label="Delete event"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className={`text-center py-4 opacity-70 ${themes[timeOfDay].text}`}>
                  No events scheduled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Event</h3>
              <button 
                onClick={() => setShowEventModal(false)} 
                className={`${DESIGN_SYSTEM.components.button.icon} text-gray-500 hover:text-gray-700 hover:scale-110`}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className={DESIGN_SYSTEM.components.input.base + ' w-full'}
                  placeholder="Study session, deadline, etc."
                  aria-label="Event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className={DESIGN_SYSTEM.components.input.base + ' w-full'}
                  aria-label="Event time"
                />
              </div>
              <button
                onClick={addEvent}
                className={`w-full ${DESIGN_SYSTEM.components.button.primary} bg-orange-500 text-white hover:bg-orange-600`}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={{
          ...appSettings,
          soundEnabled,
          events,
          moodNotes,
          studyHours,
          tasksCompleted
        }}
        onSettingsChange={(newSettings) => {
          // Update appSettings state
          setAppSettings(prev => ({ ...prev, ...newSettings }));
          
          // Update legacy settings for backward compatibility
          if (newSettings.soundEnabled !== undefined) {
            setSoundEnabled(newSettings.soundEnabled);
          }
          if (newSettings.pomodoroSoundEnabled !== undefined) {
            setSoundEnabled(newSettings.pomodoroSoundEnabled);
          }
          if (newSettings.events !== undefined) {
            setEvents(newSettings.events);
          }
          if (newSettings.moodNotes !== undefined) {
            setMoodNotes(newSettings.moodNotes);
            saveToHistory(newSettings.moodNotes);
          }
          if (newSettings.studyHours !== undefined) {
            setStudyHours(newSettings.studyHours);
          }
          if (newSettings.tasksCompleted !== undefined) {
            setTasksCompleted(newSettings.tasksCompleted);
          }
        }}
        onClearAllData={clearAllData}
      />
      
      {/* Statistics View */}
      <StatisticsView
        isOpen={showStatistics}
        onClose={() => setShowStatistics(false)}
        studyHours={studyHours}
        completedSessions={completedSessions}
        tasksCompleted={tasksCompleted}
        events={events}
        moodNotes={moodNotes}
        appSettings={appSettings}
      />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
      
      {/* Celebration Animation */}
      <CelebrationAnimation
        trigger={celebration}
        onComplete={() => {}}
      />
      
      {/* Status Bar - Last Saved Indicator */}
      <StatusBar lastSaved={lastSaved} />
    </div>
  );
}
