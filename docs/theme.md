# Vercel-Inspired Design System (Light + Dark)

A complete semantic color system inspired by modern SaaS products like:

- Vercel
- Linear
- Notion
- Raycast
- Stripe Dashboard

This system is optimized for:

- TailwindCSS
- React
- Dashboard UIs
- Editors (BlockNote / Tiptap)
- LMS platforms
- AI applications

---

# Design Philosophy

## Core Principles

- Neutral-first UI
- Minimal saturation
- Strong typography contrast
- Soft surfaces instead of harsh black/white
- Accessible focus states
- Consistent semantic tokens
- Dark mode designed first-class

---

# LIGHT THEME

## Brand Colors

| Token            | Value     | Usage             |
| ---------------- | --------- | ----------------- |
| `primary`        | `#6366F1` | Main brand color  |
| `primary-hover`  | `#4F46E5` | Hover states      |
| `primary-active` | `#4338CA` | Active states     |
| `secondary`      | `#8B5CF6` | Secondary actions |
| `accent`         | `#06B6D4` | Highlights        |
| `success`        | `#10B981` | Success states    |
| `warning`        | `#F59E0B` | Warning states    |
| `error`          | `#EF4444` | Error states      |

---

## Background System

| Token              | Value                | Usage                 |
| ------------------ | -------------------- | --------------------- |
| `bg-primary`       | `#F8FAFC`            | Main app background   |
| `bg-secondary`     | `#F1F5F9`            | Secondary backgrounds |
| `bg-surface`       | `#FFFFFF`            | Cards/modals          |
| `bg-surface-hover` | `#F8FAFC`            | Hovered cards         |
| `bg-sidebar`       | `#FFFFFF`            | Sidebar               |
| `bg-sidebar-hover` | `#F1F5F9`            | Sidebar hover         |
| `bg-overlay`       | `rgba(15,23,42,0.4)` | Modal overlays        |

---

## Text System

| Token            | Value     | Usage          |
| ---------------- | --------- | -------------- |
| `text-primary`   | `#0F172A` | Main text      |
| `text-secondary` | `#475569` | Secondary text |
| `text-muted`     | `#94A3B8` | Muted text     |
| `text-disabled`  | `#CBD5E1` | Disabled       |
| `text-inverse`   | `#FFFFFF` | White text     |

---

## Border System

| Token              | Value     |
| ------------------ | --------- |
| `border-primary`   | `#E2E8F0` |
| `border-secondary` | `#CBD5E1` |
| `border-hover`     | `#94A3B8` |
| `focus-ring`       | `#818CF8` |

---

## Button System

### Primary Button

| State      | Color         |
| ---------- | ------------- |
| Background | `#111827`     |
| Hover      | `#1F2937`     |
| Active     | `#374151`     |
| Text       | `#FFFFFF`     |
| Border     | `transparent` |

### Secondary Button

| State      | Color     |
| ---------- | --------- |
| Background | `#FFFFFF` |
| Hover      | `#F8FAFC` |
| Text       | `#0F172A` |
| Border     | `#E2E8F0` |

### Ghost Button

| State | Color     |
| ----- | --------- |
| Hover | `#F1F5F9` |
| Text  | `#475569` |

---

## Input System

| Token        | Value     |
| ------------ | --------- |
| Background   | `#FFFFFF` |
| Border       | `#E2E8F0` |
| Border Focus | `#818CF8` |
| Placeholder  | `#94A3B8` |
| Text         | `#0F172A` |

---

# DARK THEME

## Brand Colors

| Token            | Value     |
| ---------------- | --------- |
| `primary`        | `#818CF8` |
| `primary-hover`  | `#6366F1` |
| `primary-active` | `#4F46E5` |
| `secondary`      | `#A78BFA` |
| `accent`         | `#22D3EE` |
| `success`        | `#34D399` |
| `warning`        | `#FBBF24` |
| `error`          | `#F87171` |

---

## Background System

| Token              | Value             | Usage                |
| ------------------ | ----------------- | -------------------- |
| `bg-primary`       | `#0A0A0A`         | Main background      |
| `bg-secondary`     | `#111111`         | Secondary background |
| `bg-surface`       | `#171717`         | Cards                |
| `bg-surface-hover` | `#202020`         | Hovered cards        |
| `bg-sidebar`       | `#0F0F0F`         | Sidebar              |
| `bg-sidebar-hover` | `#1A1A1A`         | Sidebar hover        |
| `bg-overlay`       | `rgba(0,0,0,0.6)` | Modal overlay        |

---

## Text System

| Token            | Value     |
| ---------------- | --------- |
| `text-primary`   | `#FAFAFA` |
| `text-secondary` | `#A1A1AA` |
| `text-muted`     | `#71717A` |
| `text-disabled`  | `#52525B` |
| `text-inverse`   | `#0A0A0A` |

---

## Border System

| Token              | Value     |
| ------------------ | --------- |
| `border-primary`   | `#27272A` |
| `border-secondary` | `#3F3F46` |
| `border-hover`     | `#52525B` |
| `focus-ring`       | `#818CF8` |

---

## Button System

### Primary Button

| State      | Color     |
| ---------- | --------- |
| Background | `#FAFAFA` |
| Hover      | `#E4E4E7` |
| Active     | `#D4D4D8` |
| Text       | `#0A0A0A` |

### Secondary Button

| State      | Color     |
| ---------- | --------- |
| Background | `#18181B` |
| Hover      | `#27272A` |
| Text       | `#FAFAFA` |
| Border     | `#27272A` |

### Ghost Button

| State | Color     |
| ----- | --------- |
| Hover | `#27272A` |
| Text  | `#A1A1AA` |

---

## Input System

| Token        | Value     |
| ------------ | --------- |
| Background   | `#111111` |
| Border       | `#27272A` |
| Border Focus | `#818CF8` |
| Placeholder  | `#71717A` |
| Text         | `#FAFAFA` |

---

# Tailwind Neutral Scale

```ts
neutral: {
  50: "#FAFAFA",
  100: "#F4F4F5",
  200: "#E4E4E7",
  300: "#D4D4D8",
  400: "#A1A1AA",
  500: "#71717A",
  600: "#52525B",
  700: "#3F3F46",
  800: "#27272A",
  900: "#18181B",
  950: "#0A0A0A",
}
```

---

# Semantic CSS Variables

## Light

```css
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;

  --bg-primary: #f8fafc;
  --bg-surface: #ffffff;
  --bg-secondary: #f1f5f9;

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;

  --border-primary: #e2e8f0;
  --border-secondary: #cbd5e1;

  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;

  --focus-ring: #818cf8;
}
```

---

## Dark

```css
.dark {
  --primary: #818cf8;
  --primary-hover: #6366f1;

  --bg-primary: #0a0a0a;
  --bg-surface: #171717;
  --bg-secondary: #111111;

  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  --border-primary: #27272a;
  --border-secondary: #3f3f46;

  --success: #34d399;
  --warning: #fbbf24;
  --error: #f87171;

  --focus-ring: #818cf8;
}
```

---

# Shadows

## Light

```css
box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
```

## Dark

```css
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
```

---

# Radius System

| Token        | Value  |
| ------------ | ------ |
| `radius-sm`  | `6px`  |
| `radius-md`  | `8px`  |
| `radius-lg`  | `12px` |
| `radius-xl`  | `16px` |
| `radius-2xl` | `24px` |

---

# Typography Recommendations

## Font Stack

```css
font-family: Inter, ui-sans-serif, system-ui, sans-serif;
```

---

# AI Agent Instructions

```txt
Refactor the entire frontend to use a semantic design token system.

Requirements:
- No hardcoded colors in components
- Centralize all colors into theme tokens
- Full support for light and dark themes
- Use semantic variables:
  - primary
  - secondary
  - background
  - surface
  - text
  - border
  - success
  - warning
  - error
- Apply consistent spacing, radius, and shadow scales
- Ensure BlockNote editor follows the same theme
- Fix hover, active, disabled, and focus states globally
- Use accessible contrast ratios
- Follow a Vercel/Linear/Notion aesthetic
- Avoid pure black and pure white except intentional contrast usage
- Ensure dark mode is premium-looking and not washed out
```
