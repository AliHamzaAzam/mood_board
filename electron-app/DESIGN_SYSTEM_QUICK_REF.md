# 🎯 Design System Quick Reference

**September Dashboard - Visual Consistency Cheat Sheet**

---

## 🎴 Cards
```javascript
${DESIGN_SYSTEM.components.card.base} ${DESIGN_SYSTEM.components.card.hover}
// → backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-2xl border border-white/40 hover:scale-105 transition-transform duration-300
```

---

## 🔘 Buttons

### Primary (Action Buttons)
```javascript
${DESIGN_SYSTEM.components.button.primary} ${themes[timeOfDay].accent} text-white
// → px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 bg-amber-500 text-white
```

### Secondary (Subtle Actions)
```javascript
${DESIGN_SYSTEM.components.button.secondary}
// → px-4 py-2 rounded-xl font-medium bg-white/40 hover:bg-white/60 transition-colors duration-300
```

### Icon (Icon-Only)
```javascript
${DESIGN_SYSTEM.components.button.icon}
// → p-2 rounded-full hover:bg-white/30 transition-colors duration-300
```

---

## 📝 Inputs
```javascript
${DESIGN_SYSTEM.components.input.base}
// → px-4 py-2 rounded-xl border-2 border-white/40 bg-white/50 focus:border-orange-500 focus:outline-none transition-colors duration-300
```

---

## ⏱️ Transitions

| Speed | Value | Use Case |
|-------|-------|----------|
| Fast | `duration-150` | Instant feedback |
| Base | `duration-300` | Hover effects |
| Slow | `duration-500` | Progress bars |
| Theme | `duration-1000` | Time-of-day changes |

```javascript
${DESIGN_SYSTEM.transitions.base}  // → duration-300
```

---

## 🎨 Colors

### Text Colors
```javascript
${themes[timeOfDay].text}              // Primary
${themes[timeOfDay].text} opacity-70   // Secondary  
${themes[timeOfDay].text} opacity-50   // Disabled
```

### Accent Colors
```javascript
${themes[timeOfDay].accent}  // Themed accent (bg-amber-500, etc.)
```

### Semantic
```javascript
text-green-600   // Success
text-red-500     // Error
text-orange-500  // Warning
text-blue-500    // Info
```

---

## 📏 Spacing

- **Between sections:** `mb-6` or `space-y-6`
- **Inside cards:** `p-6`
- **Between elements:** `gap-4` or `gap-2`
- **Grid gaps:** `gap-6` large, `gap-2` calendar

---

## 🔤 Typography

```
text-xs   → 12px  (timestamps)
text-sm   → 14px  (labels)
text-base → 16px  (body)
text-lg   → 18px  (widget headers)
text-xl   → 20px  (modal titles)
text-2xl  → 24px  (section headers)
text-4xl  → 36px  (clock)
text-5xl  → 48px  (main title)
```

---

## 🎯 Icons

```
w-3 h-3  → Tiny (event dots)
w-4 h-4  → Small (button icons)
w-5 h-5  → Medium (UI controls)
w-6 h-6  → Section headers
w-8 h-8  → Feature icons
```

---

## 📦 Border Radius

```
rounded-lg   → 8px   (small elements)
rounded-xl   → 12px  (buttons, inputs)
rounded-3xl  → 24px  (cards)
rounded-full → 9999px (icon buttons)
```

---

## 📊 Progress Bars

```jsx
<div className="h-2 bg-white/40 rounded-full">
  <div className={`h-2 ${themes[timeOfDay].accent} rounded-full transition-all ${DESIGN_SYSTEM.transitions.slow}`}
       style={{width: `${percentage}%`}} />
</div>
```

**Always use `h-2` for consistency!**

---

## ♿ Accessibility

**All icon buttons must have:**
```jsx
aria-label="Descriptive action"
title="Tooltip text"
```

**All inputs must have:**
```jsx
aria-label="Field name"
```

---

## 🎭 Hover Effects

```
Buttons: hover:scale-105
Icons:   hover:scale-110
Cards:   hover:scale-105 (if clickable)
BG:      hover:bg-white/60
```

---

## ✅ Quick Checklist

When styling a component:

- [ ] Uses DESIGN_SYSTEM constants
- [ ] No hardcoded colors
- [ ] No hardcoded transitions
- [ ] Standard button style
- [ ] Hover/focus states
- [ ] Aria labels
- [ ] Consistent spacing
- [ ] Correct border radius
- [ ] Icon size consistency

---

## 🚀 Copy-Paste Templates

### Card
```jsx
<div className={`${DESIGN_SYSTEM.components.card.base} ${DESIGN_SYSTEM.components.card.hover}`}>
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-5 h-5" />
    <h2 className={`text-lg font-semibold ${themes[timeOfDay].text}`}>Title</h2>
  </div>
  {/* Content */}
</div>
```

### Primary Button
```jsx
<button
  className={`${DESIGN_SYSTEM.components.button.primary} ${themes[timeOfDay].accent} text-white`}
  aria-label="Action"
>
  Text
</button>
```

### Secondary Button
```jsx
<button
  className={DESIGN_SYSTEM.components.button.secondary}
  aria-label="Action"
>
  Text
</button>
```

### Icon Button
```jsx
<button
  className={`${DESIGN_SYSTEM.components.button.icon} hover:scale-110`}
  aria-label="Action"
  title="Tooltip"
>
  <Icon className="w-5 h-5" />
</button>
```

---

**Print this and keep it handy while coding!** 🎨
