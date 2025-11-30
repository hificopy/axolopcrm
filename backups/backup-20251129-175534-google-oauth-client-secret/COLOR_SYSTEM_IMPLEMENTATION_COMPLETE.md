# Axolop CRM - Color System Documentation

## Brand Color Palette

### Primary Colors

- **Primary Accent (CTA Buttons):** `#4F1B1B`
- **Secondary Accent (Headers & Miscellaneous):** `#0F1522`

### Background Colors

- **Light Mode App Background:** `#FFFFFF`
- **Dark Mode App Background:** `#000000`
- **Landing Page & Sub-pages Background:** `#000000`

### Metric Colors (Use for Trends & Mini Metrics)

- **Teal:** `#1A777B` - Positive trends (↑), growth metrics, high performance
- **Coral:** `#CA4238` - Negative trends (↓), decline metrics, low performance
- **Gold:** `#EBB207` - Neutral/important metrics, medium performance

### Big Metric Numbers

- **Default:** `text-neutral-900 dark:text-white` (BLACK/WHITE)
- Big display numbers should always be black (light mode) or white (dark mode)
- Colored metrics are reserved for trend indicators and mini labels

## Color Application Rules

### DO's

✅ Use `#4F1B1B` for ALL CTA buttons
✅ Use `#0F1522` for headers and miscellaneous elements
✅ Use `#FFFFFF` for light mode backgrounds
✅ Use `#000000` for dark mode and landing page backgrounds
✅ Use BLACK/WHITE for big metric numbers (`text-neutral-900 dark:text-white`)
✅ Use `#1A777B` (teal) for POSITIVE trends and growth indicators
✅ Use `#CA4238` (coral) for NEGATIVE trends and decline indicators
✅ Use `#EBB207` (gold) for neutral/important mini metrics
✅ Apply trend colors to BOTH numbers AND accompanying icons

### DON'Ts

❌ DO NOT change existing main colors and background colors
❌ DO NOT use any other colors besides these specified colors
❌ DO NOT overuse metric colors - they should be accents only
❌ DO NOT deviate from this color scheme anywhere in app

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

## Completed Implementation

### New Feature Pages Created

- [x] `/features/funnels` - Sales Funnels (ClickFunnels replacement)
- [x] `/features/calls` - Sales Dialer & Calls (Aircall replacement)
- [x] `/features/calendar` - Calendar & Scheduling (Calendly replacement)
- [x] `/features/projects` - Project Management (ClickUp replacement)
- [x] `/features/mind-maps` - Mind Maps & Visual Planning (Miro replacement)
- [x] `/features/reports` - Advanced Reports & Analytics
- [x] `/features/integrations` - Integrations & API
- [x] `/features/mobile` - Mobile App
- [x] `/features/security` - Enterprise Security
- [x] `/features/chat` - Team Chat & Collaboration (Slack replacement)

### Navigation Updates

- [x] ProductDropdown updated with all new features
- [x] App.jsx routes updated for all new pages
- [x] FeaturePageTemplate uses correct color scheme

### Color System Updates

- [x] All old colors (`#761B14`, `#d4463c`, `#9A392D`) replaced with new colors
- [x] Primary accent: `#4F1B1B` (CTA buttons)
- [x] Secondary accent: `#0F1522` (headers)
- [x] Backgrounds: `#FFFFFF` (light), `#000000` (dark)

### Metric Color System (Dashboard & Widgets)

- [x] Big metric numbers: BLACK (`text-neutral-900 dark:text-white`)
- [x] Positive trends: `#1A777B` (teal) - numbers AND icons
- [x] Negative trends: `#CA4238` (coral) - numbers AND icons
- [x] Neutral/important: `#EBB207` (gold)
- [x] Updated MetricCard.jsx (dashboard & home)
- [x] Updated RevenueChart.jsx (dashboard & home)
- [x] Updated ProfitMarginWidget.jsx (dashboard & home)
- [x] Updated FullSalesWidget.jsx (dashboard & home)
- [x] Updated FullMarketingWidget.jsx (dashboard & home)
- [x] Updated stat-card.jsx

### Competitive Positioning

Each feature page includes:

- [x] Clear value proposition vs competitors
- [x] Cost savings messaging (e.g., "Replace X and save $Y/month")
- [x] Comprehensive feature lists
- [x] Industry-specific use cases
- [x] Benefits highlighting Axolop's unique advantages

---

**Last Updated:** 2025-11-26
**Version:** 1.1.0
**Status:** ✅ Complete Implementation - Chat Feature + Metric Color System
