# Axolop CRM - Color System Documentation

## Brand Color Palette (V3.0 - Deep Plum Theme)

### Primary Colors

**Landing & Public Pages:**
- **Primary CTA (Metallic Pink):** `#E92C92` - Hot pink with metallic gradient effect
- **Background:** `#0F0510` - Deep plum/near black
- **Secondary CTA (White Metallic):** White with metallic gradient for secondary actions

**App Interior (MainLayout):**
- **Primary CTA:** `#3F0D28` - Dark plum
- **Sidebar/Header Gradient:** Pink gradient tint from `#0a0a0a` → `#1a0812` → `#3F0D28`
- **Secondary CTA (White Metallic):** Same as landing for consistency

### Accent Colors

- **Teal/Success:** `#14787b` (dark) / `#1fb5b9` (light) / `#2DCE89` (green)
- **Amber/Gold:** `amber-500` / `#F5A623`
- **Blue:** `blue-500` / `#5BB9F5`

### Background Colors

| Context | Color | Usage |
|---------|-------|-------|
| Landing Pages | `#0F0510` | All public/marketing pages |
| Section Backgrounds | `bg-black` | Section layering within pages |
| App Sidebar/Header | Pink gradient | `#0a0a0a → #1a0812 → #3F0D28` |
| Cards/Modals | `bg-white/5` | Glass morphism effect |

---

## Metallic Button Styles

### Hot Pink Metallic CTA (Landing Pages Only)

```jsx
<button
  className="px-8 py-4 rounded-xl text-white font-semibold text-lg"
  style={{
    background: 'linear-gradient(180deg, #ff85c8 0%, #E92C92 30%, #c41e78 70%, #ff69b4 100%)',
    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 8px 32px rgba(233,44,146,0.4)',
    border: '1px solid rgba(255,192,220,0.3)'
  }}
>
  Start Free Trial
</button>
```

### White Metallic CTA (Secondary Actions)

```jsx
<button
  className="px-8 py-4 rounded-xl font-semibold text-lg"
  style={{
    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.9) 50%, rgba(220,220,230,0.85) 100%)',
    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.5)',
    color: '#3F0D28'
  }}
>
  Watch Demo
</button>
```

### App Interior CTA (Dark Plum)

```jsx
<button className="btn-premium-red">
  Save Changes
</button>

// In globals.css:
.btn-premium-red {
  background: #3F0D28 !important;
  border: 1px solid rgba(63, 13, 40, 0.8) !important;
  box-shadow: 0 0 15px rgba(63, 13, 40, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.15);
}
```

---

## Color Application Rules

### Landing & Public Pages

| Element | Color | Notes |
|---------|-------|-------|
| Page Background | `#0F0510` | Deep plum |
| Primary CTA | `#E92C92` metallic | Hot pink with gradient |
| Secondary CTA | White metallic | For "Watch Demo", etc. |
| Section Overlays | `bg-black` | For layering |
| Accent Glow | `#E92C92/20` | Background glows |
| Text Hover | `#E92C92` | Link and text hovers |
| Category Pills | `#E92C92` | Active state |

### App Interior (MainLayout)

| Element | Color | Notes |
|---------|-------|-------|
| Sidebar Background | Pink gradient | Near black with plum tint |
| Header Background | Pink gradient | Horizontal variant |
| Primary CTA | `#3F0D28` | Dark plum buttons |
| Affiliate Button | White metallic | Matches landing secondary |
| Active Nav | `#3F0D28` | Dark plum background |
| Hover States | `#2D0A1E` | Slightly lighter plum |

---

## Sidebar Gradient Implementation

### Vertical (Sidebar)

```jsx
style={{
  background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0812 30%, #3F0D28 50%, #1a0812 70%, #0a0a0a 100%)'
}}
```

### Horizontal (Header)

```jsx
style={{
  background: 'linear-gradient(90deg, #0a0a0a 0%, #1a0812 30%, #3F0D28 50%, #1a0812 70%, #0a0a0a 100%)'
}}
```

---

## Chrome Text Effect (Hero Headlines)

```jsx
<h1
  style={{
    background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 25%, #c0c0c0 50%, #ffffff 75%, #d0d0d0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 2px 10px rgba(255,255,255,0.3)'
  }}
>
  Metallic Chrome Text
</h1>
```

---

## Deprecated Colors (DO NOT USE)

| Deprecated | Replacement | Context |
|------------|-------------|---------|
| `#761B14` | `#E92C92` | Landing CTAs |
| `#761B14` | `#3F0D28` | App CTAs |
| `#4F1B1B` | `#3F0D28` | App interior |
| `#d4463c` | `#E92C92` | Landing accents |
| Blue sidebar tint | Pink gradient | Sidebar/Header |

---

## Agency Theme Default (agencyThemes.js)

```javascript
default: {
  id: "default",
  name: "Default",
  description: "Axolop signature dark plum theme",
  colors: {
    gradientStart: "0 0% 4%",      // #0a0a0a
    gradientMid: "330 65% 10%",    // #1a0812
    gradientEnd: "330 65% 15%",    // #3F0D28
    hover: "330 65% 12%",          // #2D0A1E
    active: "330 65% 15%",         // #3F0D28
    accent: "#3F0D28",
  },
},
```

---

## Quick Reference

### Landing Pages
- Background: `style={{ background: '#0F0510' }}`
- Primary CTA: Metallic pink gradient button
- Secondary CTA: White metallic button
- Accents: `#E92C92`

### App Interior
- Sidebar/Header: Pink gradient tint
- Primary CTA: `#3F0D28` or `.btn-premium-red`
- Affiliate Button: White metallic
- Active States: `#3F0D28`

---

**Last Updated:** 2025-11-27
**Version:** 3.0.0 - Deep Plum Theme
**Status:** Implementation Complete
