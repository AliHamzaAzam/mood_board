# Statistics & Analytics View

## Overview
The Statistics & Analytics view provides comprehensive insights into your productivity, study habits, Pomodoro sessions, and overall progress in the September Dashboard. It features interactive charts, goal tracking, achievements, and PDF export functionality.

## Features

### 📊 Study Analytics
**Key Metrics:**
- **Total Hours**: Cumulative study time for selected period
- **Average Hours/Day**: Mean daily study duration
- **Best Study Day**: Date with highest study hours
- **Current Streak**: Consecutive days with study activity (with 🔥 flame icon)

**Visualizations:**
- **Study Hours Trend** (Line Chart): Shows study time progression over selected period
- **Daily Study Breakdown** (Bar Chart): Displays last 7 days of study activity

**Features:**
- Realistic study patterns (more on weekdays, less on weekends)
- Hover tooltips with exact values
- Responsive charts that adapt to screen size
- Color-coded with accent color from settings

### ☕ Pomodoro Statistics
**Key Metrics:**
- **Total Sessions**: All Pomodoro sessions (completed + abandoned)
- **Success Rate**: Percentage of completed sessions (✓ icon)
- **Average Daily Sessions**: Mean sessions per day
- **Completed Sessions**: Successfully finished sessions

**Visualizations:**
- **Most Productive Time** (Pie Chart): Distribution of sessions across 5 time blocks:
  - 6-9 AM (Early Morning)
  - 9-12 PM (Mid Morning)
  - 12-3 PM (Afternoon)
  - 3-6 PM (Late Afternoon)
  - 6-9 PM (Evening)
- **Session Completion** (Circular Progress): Visual success rate with completed/abandoned breakdown

**Color Scheme:**
- 5-color gradient (orange shades) for time distribution
- Green for completed, red for abandoned
- Accent color for progress circle

### 📈 Productivity Insights
**Charts:**
1. **Tasks Completion Trend** (Line Chart)
   - Daily task completion over time
   - Purple line (#a855f7)

2. **Calendar Event Density** (Bar Chart)
   - Number of events per day
   - Pink bars (#ec4899)

3. **Notes Frequency** (Bar Chart)
   - Daily mood note creation
   - Amber bars (#f59e0b)

4. **Leaves Earned Over Time** (Line Chart)
   - Gamification metric (3 leaves per study hour)
   - Green line (#10b981)
   - Total leaves counter below chart

**Insights:**
- Correlate study time with task completion
- Identify busy vs. free days from event density
- Track note-taking habits
- Visualize progress through leaves earned

### 🏆 Goals & Achievements

#### Daily Goal Progress
- **Circular Progress Bar**: 8-hour daily study goal
- Real-time percentage display
- Shows current hours / target hours
- Color changes based on progress

#### Weekly Goals (4 Goals)
1. **Study 35 hours** (weekly target)
2. **Complete 50 sessions** (Pomodoro milestone)
3. **Maintain 7-day streak** (consistency goal)
4. **Complete 30 tasks** (productivity target)

Each goal shows:
- Progress bar (orange when in progress, green when complete)
- Percentage completion
- Goal name

#### Badges (6 Available)
1. **🌅 Early Bird**: 10+ morning sessions (6-9 AM)
2. **🦉 Night Owl**: 10+ evening sessions (6-9 PM)
3. **👑 Consistency King**: 7-day study streak
4. **💯 Century Club**: 100+ Pomodoro sessions
5. **⏰ Time Master**: 100+ study hours
6. **⚔️ Task Warrior**: 50+ tasks completed

**Badge Display:**
- Earned badges: Gradient background (amber/yellow), checkmark icon
- Locked badges: Gray background, 50% opacity
- Hover shows description
- Grid layout (3 columns)

#### Milestones (5 Tracked)
1. **First Study Session** (0+ hours)
2. **10 Hours Milestone** (10+ hours)
3. **50 Sessions Completed** (50+ sessions)
4. **100 Hours Studied** (100+ hours)
5. **1 Month Streak** (30+ days)

**Milestone Display:**
- Reached: Green gradient, checkmark in circle, date shown
- Not reached: Gray background, clock icon, "Not yet"
- Chronological list

### 📅 Weekly Overview (Radar Chart)
**Only shown for "Last 7 Days" date range**

**Metrics:**
- Study Hours (blue)
- Sessions (purple) - scaled down by 2 for balance
- Tasks (green)

**Features:**
- 7-day comparison across weekdays
- Multi-metric overlay
- Legend for metric identification
- Hover for exact values

## User Interface

### Header
- **Title**: "Statistics & Analytics" with 📊 icon
- **Date Range Selector**: Dropdown with 3 options
  - Last 7 Days
  - Last 30 Days
  - All Time
- **Export PDF Button**: Downloads comprehensive report
- **Close Button**: X icon to dismiss modal

### Layout
- Full-screen modal with 90vh height
- Gradient header (orange to amber)
- White background with 95% opacity
- Scrollable content area
- 6 main sections with distinct colors:
  1. Study Analytics: Orange/Amber gradient
  2. Pomodoro Stats: Red/Orange gradient
  3. Productivity Insights: Purple/Pink gradient
  4. Goals & Achievements: Amber/Yellow gradient
  5. Weekly Overview: Blue/Cyan gradient

### Responsive Design
- Max width: 7xl (80rem)
- Grid layouts: 2-column for charts, 3-column for badges
- All charts use ResponsiveContainer for auto-sizing
- Mobile-friendly (though optimized for larger screens)

## Date Range Filtering

### Last 7 Days
- Shows recent week performance
- Enables Weekly Overview radar chart
- Daily granularity
- Best for short-term tracking

### Last 30 Days
- Monthly overview
- 30 data points on charts
- Good for trend analysis
- Weekly goals visible

### All Time
- 90 days of historical data
- Complete performance history
- Long-term trends
- Achievement tracking

**Data Generation:**
- Realistic mock data for historical periods
- Current day shows actual values
- Weekday/weekend patterns simulated
- 15% abandon rate for Pomodoro

## PDF Export

### Exported Content
1. **Header Section**
   - Title: "September Dashboard - Statistics Report"
   - Date range label
   - Generation date

2. **Study Analytics**
   - Total hours
   - Average daily hours
   - Best day with date
   - Current streak

3. **Pomodoro Statistics**
   - Total sessions
   - Completed sessions
   - Success rate percentage
   - Average daily sessions

4. **Productivity Overview**
   - Tasks completed
   - Total events
   - Notes created
   - Leaves earned

5. **Achievements**
   - Badges earned count
   - Milestones reached count
   - List of earned badges with descriptions

6. **Footer**
   - "September Dashboard - Stay Focused, Stay Productive"

### PDF Styling
- A4 page size
- Accent color from settings for titles
- Sections with clear headings
- Gray metadata text
- Professional layout
- Auto-page breaks for long content

### File Name
Format: `september-dashboard-stats-YYYY-MM-DD.pdf`
Example: `september-dashboard-stats-2024-10-01.pdf`

## Keyboard Shortcut

**Open Statistics**: `Cmd/Ctrl + S`

Added to Keyboard Shortcuts Modal under "General" category.

## Integration Points

### Props Required
```jsx
<StatisticsView
  isOpen={boolean}              // Modal visibility
  onClose={function}            // Close handler
  studyHours={number}           // Current study hours
  completedSessions={number}    // Pomodoro sessions done
  tasksCompleted={number}       // Tasks finished
  events={array}                // Calendar events
  moodNotes={array}             // Mood notes
  appSettings={object}          // App settings (for accent color)
/>
```

### State Management
- No internal persistence (uses prop data)
- Date range selection is local state
- Export menu toggle is local state
- All calculations are memoized with `useMemo`

### Dependencies
- **recharts**: Chart library (LineChart, BarChart, PieChart, RadarChart)
- **jspdf**: PDF generation
- **lucide-react**: Icons
- **React**: Hooks (useState, useMemo)

## Color System

### Accent Colors (from Settings)
```javascript
{
  orange: '#f97316',
  amber: '#f59e0b',
  red: '#ef4444',
  pink: '#ec4899',
  purple: '#a855f7',
}
```

### Chart Colors (5-color palette)
```javascript
['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']
```

### Section Gradients
- Study: `from-orange-50 to-amber-50`
- Pomodoro: `from-red-50 to-orange-50`
- Productivity: `from-purple-50 to-pink-50`
- Goals: `from-amber-50 to-yellow-50`
- Weekly: `from-blue-50 to-cyan-50`

## Performance Optimizations

1. **Memoization**: All calculations use `useMemo` to prevent recalculation
2. **Conditional Rendering**: Weekly radar only shows for 7-day range
3. **Responsive Charts**: Charts auto-resize without re-mounting
4. **Data Limits**: Max 5 upcoming events tracked internally
5. **PDF Generation**: On-demand only (not auto-generated)

## Future Enhancements

### Potential Features
- [ ] Export to CSV/JSON
- [ ] Custom date range picker (calendar)
- [ ] Print view optimization
- [ ] Share statistics via email/social
- [ ] Compare periods (week over week)
- [ ] Set custom goals
- [ ] More granular time-of-day analysis (hourly)
- [ ] Integration with external calendars
- [ ] AI-powered insights and recommendations
- [ ] Weekly/monthly email reports
- [ ] Mobile app synchronization
- [ ] Team/group statistics (multi-user)

### Chart Ideas
- Heatmap calendar (GitHub-style)
- Gantt chart for long-term projects
- Scatter plot for correlation analysis
- Stacked area chart for cumulative metrics
- Treemap for task categories
- Sankey diagram for time flow

## Troubleshooting

### Charts Not Displaying
- Ensure recharts is installed: `npm install recharts`
- Check console for ResponsiveContainer errors
- Verify data format matches chart expectations

### PDF Export Failing
- Ensure jspdf is installed: `npm install jspdf`
- Check browser console for jsPDF errors
- Verify sufficient data exists for export

### Incorrect Data
- Check that props are passed correctly
- Verify date range filtering logic
- Ensure mock data generation is working

### Performance Issues
- Reduce date range (use 7 days instead of All Time)
- Check for unnecessary re-renders
- Verify memoization is working
- Consider virtual scrolling for large datasets

## Best Practices

1. **Regular Review**: Check statistics weekly to identify patterns
2. **Set Realistic Goals**: Adjust weekly goals based on capacity
3. **Celebrate Milestones**: Acknowledge progress when milestones are reached
4. **Export Reports**: Save PDFs monthly for long-term tracking
5. **Analyze Trends**: Use charts to understand productivity patterns
6. **Badge Hunting**: Use badges as motivation for consistency
7. **Time Analysis**: Identify most productive times from Pomodoro data

## Accessibility

- Modal can be closed with close button
- All charts have tooltips for data clarity
- Color contrast meets WCAG standards
- Keyboard navigation supported (Cmd/Ctrl+S to open)
- Icons paired with text labels
- Progress bars have percentage labels

## Technical Notes

### Data Mock Strategy
- Current day uses actual prop values
- Historical days use randomized realistic data
- Weekday/weekend patterns simulated
- Consistent seed for deterministic results within session

### Chart Library Choice
**Recharts** was chosen for:
- React-native integration
- Responsive by default
- Good documentation
- Active maintenance
- MIT license
- Wide variety of chart types
- Customizable styling

### PDF Library Choice
**jsPDF** was chosen for:
- Client-side generation (no server needed)
- Simple API
- Good browser support
- Active development
- MIT license
- Small bundle size

## Usage Example

```jsx
import StatisticsView from './components/StatisticsView';

function Dashboard() {
  const [showStatistics, setShowStatistics] = useState(false);
  const [studyHours, setStudyHours] = useState(6);
  const [completedSessions, setCompletedSessions] = useState(12);
  // ... other state

  return (
    <>
      <button onClick={() => setShowStatistics(true)}>
        View Statistics
      </button>
      
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
    </>
  );
}
```

## Conclusion

The Statistics & Analytics view transforms raw productivity data into actionable insights through beautiful visualizations, goal tracking, and achievement systems. It motivates users through gamification (badges, milestones, leaves) while providing serious analytical tools (charts, trends, export) for self-improvement.
