import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw, Coffee, BookOpen, Sparkles } from 'lucide-react';

const SESSIONS_UNTIL_LONG_BREAK = 4; // Long break after 4 work sessions

const PomodoroTimer = React.forwardRef(({ 
  soundEnabled = true, 
  workDuration = 25,
  breakDuration = 5,
  longBreakDuration = 15,
  autoStartNext = false,
  onAutoStartChange,
  onSessionComplete 
}, ref) => {
  // Convert minutes to seconds
  const WORK_TIME = workDuration * 60;
  const BREAK_TIME = breakDuration * 60;
  const LONG_BREAK_TIME = longBreakDuration * 60;
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' | 'break' | 'longBreak'
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Expose toggleTimer method to parent via ref
  React.useImperativeHandle(ref, () => ({
    toggleTimer: () => {
      setIsActive(prev => !prev);
    }
  }));

  // Reset time when durations change
  useEffect(() => {
    if (!isActive) {
      if (sessionType === 'work') {
        setTimeLeft(WORK_TIME);
      } else if (sessionType === 'break') {
        setTimeLeft(BREAK_TIME);
      } else {
        setTimeLeft(LONG_BREAK_TIME);
      }
    }
  }, [workDuration, breakDuration, longBreakDuration, sessionType, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound();
    }

    // Send notification
    if (typeof window !== 'undefined' && window.electron?.sendNotification) {
      const notificationConfig = {
        work: {
          title: '🎉 Work Session Complete!',
          body: sessionsCompleted + 1 >= SESSIONS_UNTIL_LONG_BREAK 
            ? 'Amazing! Time for a 15-minute long break.' 
            : 'Great job! Time for a 5-minute break.'
        },
        break: {
          title: '☕ Break Complete!',
          body: 'Refreshed! Ready for another focus session?'
        },
        longBreak: {
          title: '✨ Long Break Complete!',
          body: 'Ready to start fresh! Let\'s begin a new cycle.'
        }
      };
      
      const notification = notificationConfig[sessionType];
      window.electron.sendNotification({
        title: notification.title,
        body: notification.body
      }).catch(() => {});
    }

    // Determine next session type
    let nextSessionType;
    let nextTimeLeft;
    
    if (sessionType === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      // Long break after 4 work sessions
      if (newSessionsCompleted % SESSIONS_UNTIL_LONG_BREAK === 0) {
        nextSessionType = 'longBreak';
        nextTimeLeft = LONG_BREAK_TIME;
      } else {
        nextSessionType = 'break';
        nextTimeLeft = BREAK_TIME;
      }
      
      if (onSessionComplete) {
        onSessionComplete('work');
      }
    } else if (sessionType === 'break' || sessionType === 'longBreak') {
      nextSessionType = 'work';
      nextTimeLeft = WORK_TIME;
      
      if (onSessionComplete) {
        onSessionComplete(sessionType);
      }
    }
    
    setSessionType(nextSessionType);
    setTimeLeft(nextTimeLeft);
    
    // Auto-start next session if enabled
    if (autoStartNext) {
      setTimeout(() => setIsActive(true), 1000);
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'work' ? WORK_TIME : sessionType === 'break' ? BREAK_TIME : LONG_BREAK_TIME);
  };

  const skipSession = () => {
    setIsActive(false);
    if (sessionType === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      if (newSessionsCompleted % SESSIONS_UNTIL_LONG_BREAK === 0) {
        setSessionType('longBreak');
        setTimeLeft(LONG_BREAK_TIME);
      } else {
        setSessionType('break');
        setTimeLeft(BREAK_TIME);
      }
    } else {
      setSessionType('work');
      setTimeLeft(WORK_TIME);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionConfig = () => {
    const configs = {
      work: {
        color: 'text-orange-500',
        bgColor: 'bg-orange-500',
        icon: <BookOpen className="w-5 h-5 text-orange-600" />,
        label: 'Focus Time',
        totalTime: WORK_TIME
      },
      break: {
        color: 'text-green-500',
        bgColor: 'bg-green-500',
        icon: <Coffee className="w-5 h-5 text-green-600" />,
        label: 'Short Break',
        totalTime: BREAK_TIME
      },
      longBreak: {
        color: 'text-purple-500',
        bgColor: 'bg-purple-500',
        icon: <Sparkles className="w-5 h-5 text-purple-600" />,
        label: 'Long Break',
        totalTime: LONG_BREAK_TIME
      }
    };
    return configs[sessionType];
  };

  const config = getSessionConfig();
  const progress = ((config.totalTime - timeLeft) / config.totalTime) * 100;

  return (
    <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="text-lg font-semibold text-gray-800">
            {config.label}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-gray-700 bg-white/40 px-3 py-1 rounded-full">
            Sessions: {sessionsCompleted}
          </div>
          {sessionsCompleted > 0 && sessionsCompleted % SESSIONS_UNTIL_LONG_BREAK === 0 && (
            <div className="text-xs bg-purple-200/60 text-purple-800 px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
              🎉 Cycle Complete!
            </div>
          )}
        </div>
      </div>

      {/* Circular Progress */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-white/40"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            className={config.color}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {config.label}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={toggleTimer}
          className={`${config.bgColor} hover:opacity-90 text-white rounded-full p-4 transition-all hover:scale-105 shadow-md`}
          title={isActive ? 'Pause' : 'Start'}
        >
          {isActive ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-3 transition-all hover:scale-105"
          title="Reset"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={skipSession}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-3 transition-all hover:scale-105"
          title="Skip session"
        >
          {sessionType === 'work' ? (
            <Coffee className="w-5 h-5" />
          ) : (
            <BookOpen className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Auto-start toggle */}
      <div className="flex items-center justify-between mb-4 bg-white/40 backdrop-blur-sm rounded-xl p-3">
        <div>
          <p className="text-sm font-medium text-gray-800">Auto-start next session</p>
          <p className="text-xs text-gray-600">Automatically begin after completion</p>
        </div>
        <button
          onClick={() => onAutoStartChange?.(!autoStartNext)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoStartNext ? config.bgColor : 'bg-gray-300'
          }`}
          title="Toggle auto-start"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoStartNext ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-700 mb-1 font-medium">
          <span>{formatTime(config.totalTime - timeLeft)} elapsed</span>
          <span>{formatTime(timeLeft)} remaining</span>
        </div>
        <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${config.bgColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Session cycle indicator */}
      <div className="mt-4 flex items-center justify-center gap-1">
        {[...Array(SESSIONS_UNTIL_LONG_BREAK)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < (sessionsCompleted % SESSIONS_UNTIL_LONG_BREAK)
                ? 'bg-orange-500 scale-110 shadow-md'
                : 'bg-white/40'
            }`}
            title={`Session ${i + 1}`}
          />
        ))}
        <span className="text-xs text-gray-700 ml-2 font-medium">
          {SESSIONS_UNTIL_LONG_BREAK - (sessionsCompleted % SESSIONS_UNTIL_LONG_BREAK)} until long break
        </span>
      </div>
    </div>
  );
});

PomodoroTimer.displayName = 'PomodoroTimer';

export default PomodoroTimer;
