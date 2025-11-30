# Axolop CRM - Color System Documentation

## Brand Color Palette

### Primary Colors

- **Primary Accent (CTA Buttons):** `#4F1B1B`
- **Secondary Accent (Headers & Miscellaneous):** `#0F1522`

### Background Colors

- **Light Mode App Background:** `#FFFFFF`
- **Dark Mode App Background:** `#000000`
- **Landing Page & Sub-pages Background:** `#000000`

### Button Gradient Colors

- **Primary Button Darker Shade:** `#3D1515`
- **Primary Button Lighter Shade:** `#5C2222`
- **Border Accent:** `#6A2525`

### Metric Colors (Use Sparingly with Each Other)

- **Gold/Yellow:** `#EBB207` - For neutral/important metrics, numbers, achievements
- **Teal:** `#1A777B` - For positive metrics, success indicators, growth numbers
- **Coral/Red:** `#CA4238` - For negative metrics, error states, decline numbers

> **IMPORTANT:** `#CA4238` (coral) should ONLY be used for:
> - Negative/error contexts
> - Alongside the other metric colors (yellow and teal)
> - Error messages and validation failures
> - Negative trend indicators
>
> **DO NOT** use `#CA4238` for:
> - CTA buttons (use `#4F1B1B` instead)
> - Primary accents (use `#4F1B1B` instead)
> - Standalone accent colors without context

## Color Application Rules

### DO's

✅ Use `#4F1B1B` for ALL CTA buttons
✅ Use `#0F1522` for headers and miscellaneous elements
✅ Use `#FFFFFF` for light mode backgrounds
✅ Use `#000000` for dark mode and landing page backgrounds
✅ Use metric colors (`#EBB207`, `#1A777B`, `#CA4238`) sparingly for:

- Mini metrics sections
- Numbers and statistics
- Achievement badges
- Progress indicators

### DON'Ts

❌ DO NOT change existing main colors and background colors
❌ DO NOT use any other colors besides these specified colors
❌ DO NOT overuse metric colors - they should be accents only
❌ DO NOT deviate from this color scheme anywhere in the app

## Component Color Guidelines

### Buttons

- Primary CTA: `bg-gradient-to-br from-[#4F1B1B] to-[#3D1515]`
- Hover: `hover:from-[#5C2222] hover:to-[#4F1B1B]`
- Secondary: Border with `border-[#4F1B1B]/60`

### Headers

- Primary: `text-[#0F1522]` (light mode) or `text-white` (dark mode)
- Secondary: `text-gray-400` or `text-gray-300`

### Backgrounds

- Landing/Dark: `bg-[#000000]`
- Light Mode: `bg-[#FFFFFF]`
- Cards: `bg-gray-900/50` with `border-gray-800/50`

### Metric Elements

- Gold accents: `text-[#EBB207]` or `bg-[#EBB207]/20`
- Teal accents: `text-[#1A777B]` or `bg-[#1A777B]/20`
- Coral accents: `text-[#CA4238]` or `bg-[#CA4238]/20`

## Deprecated Colors (DO NOT USE)

The following colors have been deprecated and should NOT be used:

| Deprecated Color | Replacement Color | Context |
|------------------|-------------------|---------|
| `#761B14` | `#4F1B1B` | Primary accent |
| `#d4463c` | `#4F1B1B` | Primary accent |
| `#9A392D` | `#3D1515` | Darker gradient shade |
| `#B85450` | `#CA4238` | Coral/error (only for metrics) |
| `emerald-*` | `#1A777B` | Success/positive indicators |

## Implementation Checklist

### Landing Page

- [x] Hero section uses correct colors
- [x] Feature cards follow color scheme
- [x] CTA buttons use `#4F1B1B`
- [x] Metric sections use accent colors sparingly

### Feature Pages

- [x] All feature pages follow consistent color scheme
- [x] Icons and badges use correct colors
- [x] Headers use `#0F1522` or white
- [x] Backgrounds are `#000000`

### App Dashboard (Post-Sign In)

- [x] Sidebar navigation colors
- [x] Header and navigation
- [x] Cards and components
- [x] Charts and metrics
- [x] Forms and inputs
- [x] Modals and overlays

### Navigation Components

- [x] Product dropdown colors
- [x] Mobile navigation
- [x] Footer links
- [x] Breadcrumb navigation

### Forms and Inputs

- [x] Input borders and focus states
- [x] Button colors
- [x] Validation messages
- [x] Form backgrounds

### Tables and Lists

- [x] Header colors
- [x] Row hover states
- [x] Border colors
- [x] Status indicators

### Charts and Analytics

- [x] Chart colors follow metric color palette
- [x] Background colors are correct
- [x] Text colors are readable

## Color Variables for CSS

```css
:root {
  --primary-accent: #4f1b1b;
  --secondary-accent: #0f1522;
  --light-bg: #ffffff;
  --dark-bg: #000000;
  --metric-gold: #ebb207;
  --metric-teal: #1a777b;
  --metric-coral: #ca4238;
}
```

## Tailwind Color Classes

Use these exact classes in implementation:

- `bg-[#4F1B1B]`, `hover:bg-[#5C2222]`
- `bg-[#0F1522]`
- `bg-[#000000]`, `bg-[#FFFFFF]`
- `text-[#EBB207]`, `bg-[#EBB207]/20`
- `text-[#1A777B]`, `bg-[#1A777B]/20`
- `text-[#CA4238]`, `bg-[#CA4238]/20`

## Testing Requirements

After implementation, verify:

1. All pages maintain color consistency
2. No other colors are introduced
3. Metric colors are used sparingly
4. CTA buttons all use `#4F1B1B`
5. Headers use `#0F1522` or white appropriately
6. Backgrounds are correct for light/dark modes

---

**Last Updated:** 2025-11-26
**Version:** 2.0.0
**Status:** Implementation Complete
