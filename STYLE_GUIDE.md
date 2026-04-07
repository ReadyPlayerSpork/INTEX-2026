# Haven for Her: Design System & Style Catalog

This document provides the design tokens and architectural patterns extracted from the Haven for Her landing page sampler. Use this guide to prompt an AI to generate pages consistent with this project's visual identity.

## 1. Global System (Tailwind 4 + shadcn/ui)
These variables are located in `index.css`.

- **Primary Radius:** `0.625rem` (lg), `calc(var(--radius) - 2px)` (md), `calc(var(--radius) - 4px)` (sm).
- **Core Variables (Light):**
  - Background: `oklch(1 0 0)`
  - Foreground: `oklch(0.145 0 0)`
  - Primary: `oklch(0.205 0 0)`
  - Secondary: `oklch(0.97 0 0)`
  - Muted: `oklch(0.97 0 0)`
  - Destructive: `oklch(0.577 0.245 27.325)`

---

## 2. Design Themes

### Theme 1: Sanctuary (Warm Editorial)
- **Palette:** 
  - Linen: `#FAF5EF` (BG)
  - Umber: `#3D261A` (Headings)
  - Terracotta: `#C06A3A` (Primary/CTA)
  - Sage: `#8B9E6B` (Accent)
  - Warm White: `#FFFBF7` (Text on color)
- **Fonts:** 
  - Display: `"DM Serif Display", serif`
  - Sans: `"Source Sans 3", sans-serif`

### Theme 2: Beacon (Bold Geometric)
- **Palette:**
  - Indigo: `#1B1F3B` (Primary Dark)
  - Coral: `#E57356` (CTA)
  - Gold: `#D4A853` (Accent)
  - Off-White: `#FAFAF5` (Light BG)
- **Fonts:**
  - Heading: `"Space Grotesk", sans-serif`
  - Body: `"Instrument Sans", sans-serif`

### Theme 3: Bloom (Soft Organic)
- **Palette:**
  - Lavender: `#F3EFF8` (BG)
  - Plum: `#4A2C5E` (Headings)
  - Sage: `#7A9E70` (Primary/CTA)
  - Blush: `#F0DDD5` (Accent)
- **Fonts:**
  - Heading: `"Fraunces", serif`
  - Body: `"Nunito", sans-serif`

### Theme 4: Chronicle (Dark Magazine)
- **Palette:**
  - Ink: `#141414` (Deep BG)
  - Gold: `#B8975A` (Accent/Links)
  - Rose: `#C4A098` (Secondary Accent)
  - Warm White: `#FAF8F5` (Main Text)
- **Fonts:**
  - Display: `"Playfair Display", serif`
  - Sans: `"Karla", sans-serif`

### Theme 5: Radiant (Vibrant Hopeful)
- **Palette:**
  - Teal: `#0D6E72` (Primary)
  - Sunshine: `#F2C744` (Accent)
  - Warm White: `#FFFBF0` (BG)
  - Charcoal: `#1E1E1E` (Headings)
- **Fonts:**
  - Heading: `"Sora", sans-serif`
  - Body: `"DM Sans", sans-serif`

### Theme 6: Refuge (Minimal Refined)
- **Palette:**
  - Snow: `#FCFAF8` (BG)
  - Near Black: `#1C1917` (Headings)
  - Dusty Rose: `#C9A9A3` (Primary)
  - Warm Stone: `#A69E94` (Muted Text)
- **Fonts:**
  - Heading: `"Outfit", sans-serif`
  - Body: `"Source Sans 3", sans-serif`

---

## 3. Structural Constraints (The "AI Prompt")
To recreate these styles, instruct the AI with the following constraints:

1. **Heading Scaling:** Use `fontSize: "clamp(2.5rem, 5vw, 4.5rem)"` for hero headings.
2. **Text Balance:** Always apply `text-balance` to headings and `text-pretty` to paragraphs.
3. **Paddings:** Sections should use `px-5 py-16 md:px-10 md:py-24` as a standard.
4. **Borders:** Use low-opacity colors for borders (e.g., `rgba(x, y, z, 0.15)`).
5. **Interactive Elements:** Buttons should have a `transition-transform hover:scale-[1.02]` or `transition-opacity hover:opacity-90`.
