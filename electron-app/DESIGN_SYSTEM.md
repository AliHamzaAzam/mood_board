# 🎨 September Dashboard - Design System Guide

This document defines the complete design system for the September Dashboard application. Use these constants and patterns to ensure visual consistency across all components.

---

## 📐 Core Design System

### Color Palette

```javascript
const DESIGN_SYSTEM = {
  colors: {
    // Time-of-Day Themes
    morning: {
      gradient: 'from-amber-200 via-orange-200 to-yellow-100',
      primary: '#f59e0b',  // amber-500
      text: '#78350f',     // amber-900
      accent: '#fb923c',   // orange-400
      cardBg: 'rgba(255, 255, 255, 0.3)',
    },
    afternoon: {
      gradient: 'from-blue-300 via-cyan-200 to-blue-100',
      primary: '#3b82f6',  // blue-500
      text: '#1e3a8a',     // blue-900
      accent: '#60a5fa',   // blue-400
      cardBg: 'rgba(255, 255, 255, 0.3)',
    },
    sunset: {
      gradient: 'from-orange-400 via-pink-300 to-purple-300',
      primary: '#f97316',  // orange-500
      text: '#7c2d12',     // orange-900
      accent: '#fb923c',   // orange-400
      cardBg: 'rgba(255, 255, 255, 0.3)',
    },
    night: {
      gradient: 'from-indigo-900 via-purple-900 to-slate-900',
      primary: '#6366f1',  // indigo-500
      text: '#e0e7ff',     // indigo-100
      accent: '#818cf8',   // indigo-400
      cardBg: 'rgba(255, 255, 255, 0.2)',
    },
    
    // Semantic Colors
    success: '#10b981',  // green-500
    warning: '#f59e0b',  // amber-500
    error: '#ef4444',    // red-500
    info: '#3b82f6',     // blue-500
    
    // Note Colors
    notes: {
      yellow: '#fef3c7',   // amber-100
      pink: '#fce7f3',     // pink-100
      blue: '#dbeafe',     // blue-100
      green: '#d1fae5',    // green-100
      purple: '#ede9fe',   // purple-100
    }
  }
};
```

---

## 🎴 Component Styles

### Cards

**Base Card:**
```javascript
className={`${DESIGN_SYSTEM.components.card.base} ${DESIGN_SYSTEM.components.card.hover}`}

// Expands to:
"backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-2xl border border-white/40 hover:scale-105 transition-transform duration-300"
```

**Usage:**
- All major widgets (Time, Music, Focus Stats)
- Pomodoro timer
- Quick Actions panel
- Mood Board container
- Calendar container

**Rules:**
- Always use `rounded-3xl` for cards
- Always use `p-6` for padding
- Always use `shadow-2xl` for shadow
- Always use `border border-white/40` for border
- Always use `backdrop-blur-md bg-white/30` for glassmorphism

---

### Buttons

**Primary Button (Action Buttons):**
```javascript
className={`${DESIGN_SYSTEM.components.button.primary} ${themes[timeOfDay].accent} text-white`}

// Expands to:
"px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 bg-amber-500 text-white"
```

**Use for:**
- "Add Note" button
- "Add Event" button  
- Submit buttons in modals
- Primary call-to-action buttons

**Secondary Button (Subtle Actions):**
```javascript
className={DESIGN_SYSTEM.components.button.secondary}

// Expands to:
"px-4 py-2 rounded-xl font-medium bg-white/40 hover:bg-white/60 transition-colors duration-300"
```

**Use for:**
- "+1 hour" / "+1 task" increment buttons
- Calendar navigation (< >)
- Calendar day cells
- Event list items
- Color picker toggle

**Icon Button (Icon-Only Actions):**
```javascript
className={DESIGN_SYSTEM.components.button.icon}

// Expands to:
"p-2 rounded-full hover:bg-white/30 transition-colors duration-300"
```

**Use for:**
- Play/pause/skip music controls
- Volume button
- Undo/redo buttons
- Rotate/edit/delete note buttons
- Header action buttons (Settings, Stats, Shortcuts)

---

### Inputs

**Base Input:**
```javascript
className={DESIGN_SYSTEM.components.input.base}

// Expands to:
"px-4 py-2 rounded-xl border-2 border-white/40 bg-white/50 focus:border-orange-500 focus:outline-none transition-colors duration-300"
```

**Use for:**
- Text inputs
- Time inputs
- Note input field
- Event title/time inputs

**Rules:**
- Always use `rounded-xl`
- Always use `px-4 py-2` for padding
- Always use `border-2 border-white/40`
- Always use `focus:border-orange-500`

---

## ⏱️ Transitions

```javascript
DESIGN_SYSTEM.transitions = {
  fast: 'duration-150',    // 150ms - instant feedback
  base: 'duration-300',    // 300ms - standard interactions
  slow: 'duration-500',    // 500ms - progress bars, animations
  theme: 'duration-1000'   // 1000ms - time-of-day theme changes
}
```

**Usage Guide:**

| Transition | Use Case | Example |
|------------|----------|---------|
| `fast` | Button clicks, toggles | N/A in current app |
| `base` | Hover effects, color changes | Most buttons, cards |
| `slow` | Progress bars, celebrations | Study hours, tasks |
| `theme` | Time-of-day transitions | Background gradient |

---

## 📏 Spacing Scale

Use Tailwind's spacing scale consistently:

- **Between sections:** `mb-6` or `space-y-6`
- **Inside cards:** `p-6`
- **Between elements:** `gap-4` or `gap-2`
- **Grid gaps:** `gap-6` for large layouts, `gap-2` for calendars

---

## 🔤 Typography

### Font Sizes

```javascript
text-xs   // 12px - timestamps, helper text
text-sm   // 14px - secondary text, labels
text-base // 16px - body text
text-lg   // 18px - widget headers
text-xl   // 20px - modal titles
text-2xl  // 24px - section headers
text-3xl  // 30px - unused
text-4xl  // 36px - main clock display
text-5xl  // 48px - main dashboard title
```

### Font Weights

```javascript
font-normal   // 400 - body text
font-medium   // 500 - secondary buttons
font-semibold // 600 - primary buttons, labels
font-bold     // 700 - headers, titles
```

### Text Colors

**ALWAYS use theme-based text colors:**

```javascript
${themes[timeOfDay].text}        // Primary text
${themes[timeOfDay].text} opacity-70  // Secondary text
${themes[timeOfDay].text} opacity-50  // Disabled/placeholder text
```

**Never use hardcoded text colors except for:**
- `text-white` on colored buttons
- `text-gray-900` in modals/light backgrounds
- Semantic colors (red-500 for errors, green-600 for success)

---

## 🎨 Icon Sizes

Standardized icon sizes:

```javascript
w-3 h-3  // Tiny indicators (event dots)
w-4 h-4  // Small inline icons (button icons, undo/redo)
w-5 h-5  // Medium UI icons (widget headers, controls)
w-6 h-6  // Section headers (mood board, calendar)
w-8 h-8  // Large feature icons (time-of-day icons)
```

---

## 📦 Border Radius

```javascript
rounded-lg   // 8px  - Small elements
rounded-xl   // 12px - Buttons, inputs
rounded-2xl  // 16px - Unused in current design
rounded-3xl  // 24px - Cards
rounded-full // 9999px - Icon buttons, circles
```

**Rules:**
- Cards: always `rounded-3xl`
- Buttons/Inputs: always `rounded-xl`
- Icon buttons: always `rounded-full`
- Small elements: `rounded-lg`

---

## 🎭 Interactive States

### Hover Effects

**Buttons & Clickable Cards:**
```javascript
hover:scale-105  // Subtle scale up
transition-transform duration-300
```

**Icon Buttons:**
```javascript
hover:scale-110  // Slightly more pronounced
```

**Background Hovers:**
```javascript
hover:bg-white/60  // Darken glassmorphic backgrounds
transition-colors duration-300
```

### Focus States

**All Inputs:**
```javascript
focus:border-orange-500 focus:outline-none
```

**All Buttons:**
```javascript
focus:outline-none focus:ring-2 focus:ring-offset-2
```

---

## 🔄 Progress Bars

**Standardized height: `h-2`**

```javascript
// Container
<div className="h-2 bg-white/40 rounded-full overflow-hidden">
  // Fill
  <div className={`h-2 ${themes[timeOfDay].accent} rounded-full transition-all ${DESIGN_SYSTEM.transitions.slow}`}
       style={{width: `${percentage}%`}}>
  </div>
</div>
```

**Used in:**
- Study hours progress
- Tasks completed progress
- Music playback progress

---

## 🎯 Accessibility

### Required Attributes

**Icon-only buttons:**
```javascript
aria-label="Descriptive action"
title="Tooltip text"
```

**Interactive regions:**
```javascript
role="button"           // For div/span clickable elements
role="progressbar"      // For progress indicators
role="dialog"          // For modals
aria-modal="true"      // For modal overlays
aria-expanded={state}  // For collapsible sections
```

### Keyboard Navigation

All interactive elements must be keyboard accessible:
- Tab order makes sense
- Enter/Space to activate
- Escape to cancel/close
- Arrow keys where appropriate

---

## 🎬 Animations

### Fade In
```javascript
className="animate-fade-in"
```

### Scale In (Modals)
```javascript
className="animate-scale-in"
```

### Slide Down (Dropdowns)
```javascript
className="animate-slide-down"
```

### Slide In Right (Notifications)
```javascript
className="animate-slide-in-right"
```

---

## 📋 Component Checklist

When creating a new component, ensure:

- [ ] Uses `DESIGN_SYSTEM` constants for all styling
- [ ] No hardcoded colors (use theme colors)
- [ ] No hardcoded transitions (use DESIGN_SYSTEM.transitions)
- [ ] Buttons use one of 3 standard styles
- [ ] Proper hover/focus states
- [ ] Accessibility attributes (aria-label, title)
- [ ] Consistent spacing (gap-4, p-6, mb-6)
- [ ] Consistent border radius (rounded-xl, rounded-3xl)
- [ ] Icons are consistent size (w-5 h-5 for UI)

---

## 🔍 Common Patterns

### Card with Header
```jsx
<div className={`${DESIGN_SYSTEM.components.card.base} ${DESIGN_SYSTEM.components.card.hover}`}>
  <div className="flex items-center gap-2 mb-4">
    <IconComponent className="w-5 h-5" />
    <h2 className={`text-lg font-semibold ${themes[timeOfDay].text}`}>
      Widget Title
    </h2>
  </div>
  {/* Content */}
</div>
```

### Primary Action Button
```jsx
<button
  onClick={handleAction}
  className={`${DESIGN_SYSTEM.components.button.primary} ${themes[timeOfDay].accent} text-white shadow-lg flex items-center gap-2`}
  aria-label="Action description"
>
  <IconComponent className="w-4 h-4" />
  Button Text
</button>
```

### Secondary Action Button
```jsx
<button
  onClick={handleAction}
  className={DESIGN_SYSTEM.components.button.secondary}
  aria-label="Action description"
>
  Button Text
</button>
```

### Icon Button
```jsx
<button
  onClick={handleAction}
  className={`${DESIGN_SYSTEM.components.button.icon} hover:scale-110`}
  aria-label="Action description"
  title="Tooltip text"
>
  <IconComponent className="w-5 h-5" />
</button>
```

---

## 🎨 Color Usage Examples

### Themed Background
```jsx
<div className={`bg-gradient-to-br ${themes[timeOfDay].gradient} transition-all ${DESIGN_SYSTEM.transitions.theme}`}>
```

### Themed Text
```jsx
<h1 className={`text-5xl font-bold ${themes[timeOfDay].text}`}>
```

### Themed Accent
```jsx
<button className={`${themes[timeOfDay].accent} text-white`}>
```

### Semantic Colors
```jsx
<span className="text-green-600">Success message</span>
<span className="text-red-500">Error message</span>
<span className="text-orange-500">Warning message</span>
<span className="text-blue-500">Info message</span>
```

---

## 🚫 Anti-Patterns (Don't Do This)

❌ **Hardcoded colors:**
```javascript
className="bg-blue-500"  // BAD
```

✅ **Use design system:**
```javascript
className={themes[timeOfDay].accent}  // GOOD
```

---

❌ **Hardcoded transitions:**
```javascript
className="transition-all duration-300"  // BAD
```

✅ **Use design system:**
```javascript
className={`transition-all ${DESIGN_SYSTEM.transitions.base}`}  // GOOD
```

---

❌ **Inconsistent button styles:**
```javascript
className="px-3 py-1 rounded-lg hover:bg-gray-200"  // BAD
```

✅ **Use standard button:**
```javascript
className={DESIGN_SYSTEM.components.button.secondary}  // GOOD
```

---

❌ **Mixed progress bar heights:**
```javascript
className="h-1"  // BAD in one place
className="h-2"  // BAD in another place
```

✅ **Consistent height:**
```javascript
className="h-2"  // GOOD everywhere
```

---

## 📚 Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev/icons
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

## 🔄 Updating the Design System

When modifying the design system:

1. Update `DESIGN_SYSTEM` constant in `SeptemberDashboard.jsx`
2. Search for all usages: `CMD+F` for "DESIGN_SYSTEM"
3. Update this guide with new patterns
4. Test all theme transitions (morning → afternoon → sunset → night)
5. Verify on both macOS and Windows (if applicable)

---

**Last Updated:** October 1, 2025  
**Version:** 1.0  
**Maintainer:** September Dashboard Team
