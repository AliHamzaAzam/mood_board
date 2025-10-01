import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Calendar, Coffee, Target, Award, Download, 
  X, ChevronDown, Trophy, Flame, Star, BookOpen, Heart,
  Clock, CheckCircle, BarChart3, Activity
} from 'lucide-react';
import jsPDF from 'jspdf';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];
const ACCENT_COLORS = {
  orange: '#f97316',
  amber: '#f59e0b',
  red: '#ef4444',
  pink: '#ec4899',
  purple: '#a855f7',
};

export default function StatisticsView({ 
  isOpen, 
  onClose, 
  studyHours, 
  completedSessions,
  tasksCompleted,
  events,
  moodNotes,
  appSettings 
}) {
  const [dateRange, setDateRange] = useState('7days'); // '7days', '30days', 'all'
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Calculate date range
  const getFilteredDate = () => {
    const now = new Date();
    switch(dateRange) {
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // All time
    }
  };

  // Generate study data with mock historical data
  const studyData = useMemo(() => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Generate realistic study hours (more on weekdays, less on weekends)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseHours = isWeekend ? 2 : 5;
      const variance = Math.random() * 3;
      const hours = i === 0 ? studyHours : Math.round((baseHours + variance) * 10) / 10;
      
      data.push({
        date: monthDay,
        day: dayName,
        hours: hours,
        sessions: Math.floor(hours * 2), // ~2 sessions per hour
      });
    }
    
    return data;
  }, [dateRange, studyHours]);

  // Calculate study analytics
  const studyAnalytics = useMemo(() => {
    const totalHours = studyData.reduce((sum, day) => sum + day.hours, 0);
    const avgHours = totalHours / studyData.length;
    const bestDay = studyData.reduce((best, day) => 
      day.hours > best.hours ? day : best, studyData[0]);
    
    // Calculate streak
    let streak = 0;
    for (let i = studyData.length - 1; i >= 0; i--) {
      if (studyData[i].hours > 0) streak++;
      else break;
    }
    
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      avgHours: Math.round(avgHours * 10) / 10,
      bestDay: bestDay,
      streak: streak,
      weeklyGoal: dateRange === '7days' ? Math.round((totalHours / 35) * 100) : 0, // 35 hours target
    };
  }, [studyData, dateRange]);

  // Pomodoro stats with mock data
  const pomodoroStats = useMemo(() => {
    const totalSessions = completedSessions + Math.floor(Math.random() * 20);
    const abandonedSessions = Math.floor(totalSessions * 0.15); // 15% abandon rate
    const successRate = Math.round(((totalSessions - abandonedSessions) / totalSessions) * 100);
    const avgDaily = Math.round((totalSessions / studyData.length) * 10) / 10;
    
    // Time of day distribution
    const timeDistribution = [
      { time: '6-9 AM', sessions: Math.floor(totalSessions * 0.15), fill: COLORS[0] },
      { time: '9-12 PM', sessions: Math.floor(totalSessions * 0.30), fill: COLORS[1] },
      { time: '12-3 PM', sessions: Math.floor(totalSessions * 0.20), fill: COLORS[2] },
      { time: '3-6 PM', sessions: Math.floor(totalSessions * 0.25), fill: COLORS[3] },
      { time: '6-9 PM', sessions: Math.floor(totalSessions * 0.10), fill: COLORS[4] },
    ];
    
    return {
      totalSessions,
      completedSessions: totalSessions - abandonedSessions,
      abandonedSessions,
      successRate,
      avgDaily,
      timeDistribution,
    };
  }, [completedSessions, studyData]);

  // Productivity insights
  const productivityInsights = useMemo(() => {
    const days = studyData.length;
    const tasksTrend = studyData.map((day, i) => ({
      date: day.date,
      tasks: i === days - 1 ? tasksCompleted : Math.floor(Math.random() * 10 + 2),
    }));
    
    const eventDensity = studyData.map((day, i) => ({
      date: day.date,
      events: Math.floor(Math.random() * 5),
    }));
    
    const notesFrequency = studyData.map((day, i) => ({
      date: day.date,
      notes: i === days - 1 ? moodNotes.length : Math.floor(Math.random() * 8),
    }));
    
    const leavesEarned = studyData.map((day, i) => ({
      date: day.date,
      leaves: Math.floor(day.hours * 3), // 3 leaves per study hour
    }));
    
    return {
      tasksTrend,
      eventDensity,
      notesFrequency,
      leavesEarned,
      totalLeaves: leavesEarned.reduce((sum, d) => sum + d.leaves, 0),
    };
  }, [studyData, tasksCompleted, moodNotes]);

  // Goals and achievements
  const goalsAchievements = useMemo(() => {
    const dailyGoalProgress = Math.min((studyHours / 8) * 100, 100); // 8 hours daily goal
    const weeklyGoals = [
      { goal: 'Study 35 hours', progress: studyAnalytics.weeklyGoal, completed: studyAnalytics.weeklyGoal >= 100 },
      { goal: 'Complete 50 sessions', progress: Math.min((pomodoroStats.totalSessions / 50) * 100, 100), completed: pomodoroStats.totalSessions >= 50 },
      { goal: 'Maintain 7-day streak', progress: Math.min((studyAnalytics.streak / 7) * 100, 100), completed: studyAnalytics.streak >= 7 },
      { goal: 'Complete 30 tasks', progress: Math.min((tasksCompleted / 30) * 100, 100), completed: tasksCompleted >= 30 },
    ];
    
    const badges = [
      { name: 'Early Bird', icon: '🌅', earned: pomodoroStats.timeDistribution[0]?.sessions > 10, description: '10+ morning sessions' },
      { name: 'Night Owl', icon: '🦉', earned: pomodoroStats.timeDistribution[4]?.sessions > 10, description: '10+ evening sessions' },
      { name: 'Consistency King', icon: '👑', earned: studyAnalytics.streak >= 7, description: '7-day streak' },
      { name: 'Century Club', icon: '💯', earned: pomodoroStats.totalSessions >= 100, description: '100+ sessions' },
      { name: 'Time Master', icon: '⏰', earned: studyAnalytics.totalHours >= 100, description: '100+ hours' },
      { name: 'Task Warrior', icon: '⚔️', earned: tasksCompleted >= 50, description: '50+ tasks completed' },
    ];
    
    const milestones = [
      { name: 'First Study Session', reached: studyAnalytics.totalHours > 0, date: 'Sep 1, 2024' },
      { name: '10 Hours Milestone', reached: studyAnalytics.totalHours >= 10, date: 'Sep 5, 2024' },
      { name: '50 Sessions Completed', reached: pomodoroStats.totalSessions >= 50, date: 'Sep 12, 2024' },
      { name: '100 Hours Studied', reached: studyAnalytics.totalHours >= 100, date: 'Sep 28, 2024' },
      { name: '1 Month Streak', reached: studyAnalytics.streak >= 30, date: 'Not yet' },
    ];
    
    return {
      dailyGoalProgress,
      weeklyGoals,
      badges,
      earnedBadges: badges.filter(b => b.earned).length,
      milestones,
      reachedMilestones: milestones.filter(m => m.reached).length,
    };
  }, [studyHours, studyAnalytics, pomodoroStats, tasksCompleted]);

  // Weekly overview radar data
  const weeklyRadarData = useMemo(() => {
    if (dateRange !== '7days') return [];
    
    return studyData.slice(-7).map(day => ({
      day: day.day,
      'Study Hours': day.hours,
      'Sessions': day.sessions / 2, // Scale down for radar
      'Tasks': Math.floor(Math.random() * 10),
    }));
  }, [studyData, dateRange]);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const accentColor = ACCENT_COLORS[appSettings.accentColor] || COLORS[0];
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(accentColor);
    doc.text('September Dashboard - Statistics Report', 20, 20);
    
    // Date range
    doc.setFontSize(10);
    doc.setTextColor(100);
    const rangeText = dateRange === '7days' ? 'Last 7 Days' : dateRange === '30days' ? 'Last 30 Days' : 'All Time';
    doc.text(`Period: ${rangeText}`, 20, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 33);
    
    // Study Analytics Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Study Analytics', 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Total Hours: ${studyAnalytics.totalHours} hours`, 25, 53);
    doc.text(`Average Daily: ${studyAnalytics.avgHours} hours`, 25, 59);
    doc.text(`Best Day: ${studyAnalytics.bestDay.date} (${studyAnalytics.bestDay.hours} hours)`, 25, 65);
    doc.text(`Current Streak: ${studyAnalytics.streak} days`, 25, 71);
    
    // Pomodoro Stats Section
    doc.setFontSize(14);
    doc.text('Pomodoro Statistics', 20, 85);
    
    doc.setFontSize(10);
    doc.text(`Total Sessions: ${pomodoroStats.totalSessions}`, 25, 93);
    doc.text(`Completed: ${pomodoroStats.completedSessions}`, 25, 99);
    doc.text(`Success Rate: ${pomodoroStats.successRate}%`, 25, 105);
    doc.text(`Average Daily: ${pomodoroStats.avgDaily} sessions`, 25, 111);
    
    // Productivity Insights
    doc.setFontSize(14);
    doc.text('Productivity Overview', 20, 125);
    
    doc.setFontSize(10);
    doc.text(`Tasks Completed: ${tasksCompleted}`, 25, 133);
    doc.text(`Total Events: ${events.length}`, 25, 139);
    doc.text(`Notes Created: ${moodNotes.length}`, 25, 145);
    doc.text(`Leaves Earned: ${productivityInsights.totalLeaves}`, 25, 151);
    
    // Goals & Achievements
    doc.setFontSize(14);
    doc.text('Achievements', 20, 165);
    
    doc.setFontSize(10);
    doc.text(`Badges Earned: ${goalsAchievements.earnedBadges}/${goalsAchievements.badges.length}`, 25, 173);
    doc.text(`Milestones Reached: ${goalsAchievements.reachedMilestones}/${goalsAchievements.milestones.length}`, 25, 179);
    
    let yPos = 187;
    goalsAchievements.badges.filter(b => b.earned).forEach((badge, i) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${badge.icon} ${badge.name} - ${badge.description}`, 30, yPos);
      yPos += 6;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('September Dashboard - Stay Focused, Stay Productive', 20, 285);
    
    // Save
    doc.save(`september-dashboard-stats-${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  if (!isOpen) return null;

  const accentColor = ACCENT_COLORS[appSettings.accentColor] || COLORS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-7xl h-[90vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-slide-down">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Statistics & Analytics</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors cursor-pointer"
            >
              <option value="7days" className="text-gray-800">Last 7 Days</option>
              <option value="30days" className="text-gray-800">Last 30 Days</option>
              <option value="all" className="text-gray-800">All Time</option>
            </select>
            
            {/* Export Button */}
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(90vh-80px)] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Study Analytics Section */}
            <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Study Analytics</h3>
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{studyAnalytics.totalHours}</div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600">{studyAnalytics.avgHours}</div>
                  <div className="text-sm text-gray-600">Avg Hours/Day</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{studyAnalytics.bestDay.date}</div>
                  <div className="text-sm text-gray-600">Best Study Day</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-3xl font-bold text-orange-600">
                    <Flame className="w-6 h-6" />
                    {studyAnalytics.streak}
                  </div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                {/* Line Chart - Study Hours Over Time */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Study Hours Trend</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={studyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          border: '1px solid #f97316'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        stroke={accentColor} 
                        strokeWidth={3}
                        dot={{ fill: accentColor, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Bar Chart - Daily Breakdown */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Daily Study Breakdown</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={studyData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          border: '1px solid #f97316'
                        }}
                      />
                      <Bar dataKey="hours" fill={accentColor} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Pomodoro Statistics Section */}
            <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-gray-800">Pomodoro Statistics</h3>
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{pomodoroStats.totalSessions}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{pomodoroStats.successRate}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{pomodoroStats.avgDaily}</div>
                  <div className="text-sm text-gray-600">Avg Daily Sessions</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{pomodoroStats.completedSessions}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                {/* Pie Chart - Time Distribution */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Most Productive Time</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pomodoroStats.timeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ time, percent }) => `${time}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {pomodoroStats.timeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Session Completion Chart */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Session Completion</h4>
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <svg className="transform -rotate-90" width="180" height="180">
                          <circle
                            cx="90"
                            cy="90"
                            r="70"
                            fill="none"
                            stroke="#f0f0f0"
                            strokeWidth="20"
                          />
                          <circle
                            cx="90"
                            cy="90"
                            r="70"
                            fill="none"
                            stroke={accentColor}
                            strokeWidth="20"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - pomodoroStats.successRate / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl font-bold text-gray-800">{pomodoroStats.successRate}%</div>
                        </div>
                      </div>
                      <div className="mt-4 text-gray-600">
                        <div className="text-sm">
                          <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
                          {pomodoroStats.completedSessions} Completed
                        </div>
                        <div className="text-sm">
                          <X className="w-4 h-4 inline mr-1 text-red-600" />
                          {pomodoroStats.abandonedSessions} Abandoned
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Productivity Insights Section */}
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">Productivity Insights</h3>
              </div>
              
              {/* Charts Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Tasks Completion Trend */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Tasks Completion Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={productivityInsights.tasksTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="tasks" stroke="#a855f7" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Event Density */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Calendar Event Density</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={productivityInsights.eventDensity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="events" fill="#ec4899" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Notes Frequency */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Notes Frequency</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={productivityInsights.notesFrequency}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="notes" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Leaves Earned */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Leaves Earned Over Time</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={productivityInsights.leavesEarned}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="leaves" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-2 text-center">
                    <span className="text-2xl font-bold text-green-600">{productivityInsights.totalLeaves}</span>
                    <span className="text-sm text-gray-600 ml-2">Total Leaves Earned 🍂</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Goals & Achievements Section */}
            <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-amber-600" />
                <h3 className="text-xl font-bold text-gray-800">Goals & Achievements</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Daily Goal Progress */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Daily Goal Progress</h4>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <svg className="transform -rotate-90" width="200" height="200">
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#f0f0f0"
                          strokeWidth="20"
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke={accentColor}
                          strokeWidth="20"
                          strokeDasharray={`${2 * Math.PI * 80}`}
                          strokeDashoffset={`${2 * Math.PI * 80 * (1 - goalsAchievements.dailyGoalProgress / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold text-gray-800">
                          {Math.round(goalsAchievements.dailyGoalProgress)}%
                        </div>
                        <div className="text-sm text-gray-600">of 8 hours</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    {studyHours} / 8 hours studied today
                  </div>
                </div>
                
                {/* Weekly Goals */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Weekly Goals</h4>
                  <div className="space-y-3">
                    {goalsAchievements.weeklyGoals.map((goal, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{goal.goal}</span>
                          <span className="text-xs text-gray-500">{Math.round(goal.progress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{ 
                              width: `${Math.min(goal.progress, 100)}%`,
                              backgroundColor: goal.completed ? '#10b981' : accentColor
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Badges */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">Badges Earned</h4>
                    <span className="text-xs text-gray-500">
                      {goalsAchievements.earnedBadges}/{goalsAchievements.badges.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {goalsAchievements.badges.map((badge, index) => (
                      <div
                        key={index}
                        className={`relative p-3 rounded-xl text-center transition-all ${
                          badge.earned 
                            ? 'bg-gradient-to-br from-amber-100 to-yellow-100 shadow-md' 
                            : 'bg-gray-100 opacity-50'
                        }`}
                      >
                        <div className="text-3xl mb-1">{badge.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{badge.name}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{badge.description}</div>
                        {badge.earned && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Milestones */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">Milestones</h4>
                    <span className="text-xs text-gray-500">
                      {goalsAchievements.reachedMilestones}/{goalsAchievements.milestones.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {goalsAchievements.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          milestone.reached 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100' 
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.reached ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {milestone.reached ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Clock className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{milestone.name}</div>
                          <div className="text-xs text-gray-500">{milestone.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Weekly Overview Radar (only for 7 days) */}
            {dateRange === '7days' && weeklyRadarData.length > 0 && (
              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">Weekly Overview</h3>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={weeklyRadarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis tick={{ fontSize: 11 }} />
                      <Radar name="Study Hours" dataKey="Study Hours" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Radar name="Sessions" dataKey="Sessions" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Radar name="Tasks" dataKey="Tasks" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
