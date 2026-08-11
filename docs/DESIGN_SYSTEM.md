# Sentinela Design System

## Overview

This document describes the design system used throughout the Sentinela application.

## Colors

### Brand Colors
- **Primary:** `#3B82F6` (Blue 500)
- **Primary Dark:** `#1D4ED8` (Blue 700)
- **Primary Light:** `#93C5FD` (Blue 300)

### Semantic Colors
- **Success:** `#10B981` (Emerald 500)
- **Warning:** `#F59E0B` (Amber 500)
- **Error:** `#EF4444` (Red 500)
- **Info:** `#3B82F6` (Blue 500)

### Neutral Colors
- **Gray 50:** `#F9FAFB`
- **Gray 100:** `#F3F4F6`
- **Gray 200:** `#E5E7EB`
- **Gray 300:** `#D1D5DB`
- **Gray 400:** `#9CA3AF`
- **Gray 500:** `#6B7280`
- **Gray 600:** `#4B5563`
- **Gray 700:** `#374151`
- **Gray 800:** `#1F2937`
- **Gray 900:** `#111827`

## Typography

### Font Family
- **Sans:** Inter, system-ui, sans-serif
- **Mono:** JetBrains Mono, monospace

### Font Sizes
| Name | Size | Line Height |
|------|------|-------------|
| xs | 12px | 16px |
| sm | 14px | 20px |
| base | 16px | 24px |
| lg | 18px | 28px |
| xl | 20px | 28px |
| 2xl | 24px | 32px |
| 3xl | 30px | 36px |
| 4xl | 36px | 40px |

### Font Weights
- **Normal:** 400
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700

## Spacing

Based on 4px grid system:

| Token | Value |
|-------|-------|
| 0 | 0px |
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 5 | 20px |
| 6 | 24px |
| 8 | 32px |
| 10 | 40px |
| 12 | 48px |
| 16 | 64px |
| 20 | 80px |
| 24 | 96px |

## Border Radius

| Token | Value |
|-------|-------|
| none | 0px |
| sm | 2px |
| default | 4px |
| md | 6px |
| lg | 8px |
| xl | 12px |
| 2xl | 16px |
| full | 9999px |

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

## Breakpoints

| Name | Min Width |
|------|-----------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| dropdown | 1000 | Dropdowns, selects |
| sticky | 1020 | Sticky headers |
| fixed | 1030 | Fixed elements |
| modal-backdrop | 1040 | Modal backdrops |
| modal | 1050 | Modals |
| popover | 1060 | Popovers, tooltips |
| toast | 1070 | Toast notifications |

## Animation

### Durations
- **Fast:** 150ms
- **Normal:** 300ms
- **Slow:** 500ms

### Easing
- **Default:** cubic-bezier(0.4, 0, 0.2, 1)
- **In:** cubic-bezier(0.4, 0, 1, 1)
- **Out:** cubic-bezier(0, 0, 0.2, 1)
- **In-Out:** cubic-bezier(0.4, 0, 0.2, 1)

## Dark Mode

The design system supports dark mode through CSS custom properties:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
}

.dark {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
}
```

## Accessibility

- All interactive elements have visible focus states
- Color contrast ratios meet WCAG 2.1 AA standards
- Support for reduced motion preferences
- Semantic HTML structure
- ARIA labels where appropriate
