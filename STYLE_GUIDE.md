# Haven for Her — Style Guide

Canonical design reference for the **Bloom** theme. Brand personality, voice, and design principles live in `.impeccable.md` — read that first for the "why."

> **Implementation rule:** Use **Tailwind utility classes** and **shadcn/ui components** for all styling. No custom CSS, inline `style={{ }}`, `@apply`, or CSS modules. The only CSS in `index.css` should be `@import`, `@theme`, and `:root` variable definitions. If Tailwind can't express a need, extend via CSS custom properties in `:root`.

---

## Color Palette

All values use **oklch** for perceptual uniformity. Hex is for human reference only.

### Semantic Roles

| Role | Name | Hex | oklch | Usage |
|------|------|-----|-------|-------|
| Page background | Lavender | `#F3EFF8` | `oklch(0.958 0.013 306)` | Default page/section bg |
| Primary action | Sage | `#4E7842` | `oklch(0.528 0.094 139)` | Buttons, links, CTAs, positive indicators |
| Headings & emphasis | Plum | `#4A2C5E` | `oklch(0.354 0.090 310)` | Headings, bold labels, dark section bg (footer, CTA) |
| Body text | Soft Purple | `#5E4570` | `oklch(0.435 0.075 310)` | Paragraphs, descriptions — never use gray |
| Card surfaces | Cream | `#FFF8F3` | `oklch(0.983 0.010 58)` | Cards, nav, elevated containers |
| Warm accent | Blush | `#F0DDD5` | `oklch(0.911 0.024 44)` | Testimonial bg, decorative elements |
| Text on dark | Warm White | `#FDFBF8` | `oklch(0.989 0.005 78)` | Text on plum/sage bg — never pure `#fff` |
| Muted bg | Muted Lavender | `#EDE8F3` | `oklch(0.938 0.016 306)` | Muted backgrounds |
| Borders | Border Lavender | `#E2DAF0` | `oklch(0.901 0.031 302)` | Borders and input outlines |
| Destructive | Warm Red | `#C24D4D` | `oklch(0.575 0.151 23)` | Destructive actions |
| Chart accent | Blend | `#8B7BA0` | `oklch(0.611 0.058 304)` | Sage-plum chart accent |

### shadcn / Tailwind CSS Variables

Replace the default shadcn `:root` in `src/index.css`. **Remove the `.dark` block and `@custom-variant dark`** — light-mode only.

```
:root {
  --background:             oklch(0.958 0.013 306);   /* lavender */
  --foreground:             oklch(0.435 0.075 310);   /* soft purple — body text */

  --card:                   oklch(0.983 0.010 58);    /* cream */
  --card-foreground:        oklch(0.354 0.090 310);   /* plum */

  --popover:                oklch(0.983 0.010 58);    /* cream */
  --popover-foreground:     oklch(0.354 0.090 310);   /* plum */

  --primary:                oklch(0.528 0.094 139);   /* sage — CTAs */
  --primary-foreground:     oklch(0.989 0.005 78);    /* warm white */

  --secondary:              oklch(0.911 0.024 44);    /* blush */
  --secondary-foreground:   oklch(0.354 0.090 310);   /* plum */

  --muted:                  oklch(0.938 0.016 306);   /* slightly deeper lavender */
  --muted-foreground:       oklch(0.435 0.075 310);   /* soft purple */

  --accent:                 oklch(0.354 0.090 310);   /* plum — emphasis */
  --accent-foreground:      oklch(0.989 0.005 78);    /* warm white */

  --destructive:            oklch(0.575 0.151 23);    /* warm red, not neon */
  --destructive-foreground: oklch(0.989 0.005 78);    /* warm white */

  --border:                 oklch(0.901 0.031 302);   /* tinted lavender border */
  --input:                  oklch(0.901 0.031 302);
  --ring:                   oklch(0.528 0.094 139);   /* sage focus ring */

  --radius:                 0.75rem;                   /* global rounding base */

  --chart-1:                oklch(0.528 0.094 139);   /* sage */
  --chart-2:                oklch(0.354 0.090 310);   /* plum */
  --chart-3:                oklch(0.911 0.024 44);    /* blush */
  --chart-4:                oklch(0.435 0.075 310);   /* soft purple */
  --chart-5:                oklch(0.611 0.058 304);   /* sage-plum blend */

  --sidebar:                oklch(0.983 0.010 58);    /* cream */
  --sidebar-foreground:     oklch(0.354 0.090 310);   /* plum */
  --sidebar-primary:        oklch(0.528 0.094 139);   /* sage */
  --sidebar-primary-foreground: oklch(0.989 0.005 78);/* warm white */
  --sidebar-accent:         oklch(0.938 0.016 306);   /* muted lavender */
  --sidebar-accent-foreground: oklch(0.354 0.090 310);/* plum */
  --sidebar-border:         oklch(0.901 0.031 302);   /* border lavender */
  --sidebar-ring:           oklch(0.528 0.094 139);   /* sage */
}
```

### Color Rules

- **No pure gray** (`slate-500`, `gray-200`, etc.) — neutrals are tinted via theme variables.
- **No pure black/white** — darkest is plum, lightest is warm white.
- **60-30-10:** 60% lavender/cream surfaces, 30% plum/soft-purple text, 10% sage accents.
- **Blush is a surface only** — use for testimonial/highlight backgrounds, never for text or borders.

### Surface Stacking

| Surface | Allowed on | Notes |
|---------|-----------|-------|
| Cream card | Lavender, Plum | Primary card pattern |
| Blush card | Lavender | Warm accent card |
| Cream card | Blush section | Nested content in blush areas |
| **Never** | Blush on Cream | Too similar |
| **Never** | Cream on Cream | No visible elevation |
| **Never** | Lavender on Blush | Cool-on-warm clash |

---

## Typography

### Font Stack

| Role | Font | Fallback | Tailwind |
|------|------|----------|----------|
| Headings (h1–h4, logo, pull-quotes, stat numbers) | Fraunces | Georgia, serif | `font-heading` |
| Everything else (body, labels, buttons, nav) | Nunito | system-ui, sans-serif | `font-body` / `font-sans` |

Loaded via Google Fonts `<link>` in `index.html`. Theme config in `index.css`:

```
--font-heading: "Fraunces", Georgia, serif;
--font-body: "Nunito", system-ui, sans-serif;
--font-sans: "Nunito", system-ui, sans-serif;
```

### Hierarchy

| Element | Font | Weight | Size | Color |
|---------|------|--------|------|-------|
| h1 | Fraunces | 600 | `text-4xl md:text-5xl lg:text-6xl` | plum |
| h2 | Fraunces | 600 | `text-3xl md:text-4xl` | plum |
| h3 | Fraunces | 600 | `text-lg md:text-xl` | plum |
| Body | Nunito | 400 | `text-base md:text-lg` | soft purple, `leading-relaxed` |
| Small/caption | Nunito | 400 | `text-sm` | soft purple |
| Button | Nunito | 600 | `text-sm md:text-base` | per variant |
| Nav link | Nunito | 400 | `text-sm md:text-base` | soft purple |
| Stat number | Fraunces | 600 | `text-3xl md:text-5xl` | sage or plum |

### Typography Rules

- **`text-balance`** on headlines, **`text-pretty`** on body paragraphs.
- **Max reading width:** `max-w-xl` to `max-w-2xl` (~45–65 chars/line).

---

## Shape & Spacing

### Border Radius

| Element | Tailwind |
|---------|----------|
| Buttons, badges, pills | `rounded-full` |
| Cards, modals | `rounded-2xl` |
| Hero/feature containers | `rounded-3xl` |
| Inputs, selects | `rounded-lg` |

### Spacing Rhythm

- **Section padding:** `py-16 md:py-24` (standard), `py-20 md:py-28` (feature/CTA); `px-4 md:px-6` + `max-w-6xl mx-auto`
- **Card padding:** `p-6 md:p-7`; internal gap `gap-3`
- **Grid gap:** `gap-4` to `gap-6`
- **Heading → body:** `mb-5` to `mb-6`

### Shadows

Soft and tinted, not harsh gray.

- **Card:** `shadow-sm` or `shadow-[0_4px_24px_rgba(74,44,94,0.03)]` (plum-tinted)
- **Nav:** `shadow-[0_2px_12px_rgba(74,44,94,0.08)]`
- **Never** `shadow-lg` / `shadow-xl` on cards — rely on surface color contrast instead.

---

## Motion & Transitions

Moderate motion — alive but never distracting.

| Context | Duration | Easing | Tailwind |
|---------|----------|--------|----------|
| Hover/focus color | 150ms | ease-out | `transition-colors duration-150` |
| Card hover lift | 200ms | ease-out | `transition-transform duration-200` |
| Section entrance | 500ms | ease-out (quart) | `motion-safe:animate-fade-up` |
| Modal/popover | 200ms | ease-out | `transition-all duration-200` |

- **All animation in `motion-safe:`** for `prefers-reduced-motion` support.
- **Only animate `transform` and `opacity`** — never layout properties.
- **Easing:** `ease-out` or `cubic-bezier(0.33, 1, 0.68, 1)`. No bounce/elastic/spring.
- **Hover states** use color transitions, not `hover:opacity-*`.
- **Scroll entrances:** fade up 8–12px, opacity 0→1, stagger siblings 75–100ms.
- **No auto-playing loops.**

---

## Focus & Keyboard Accessibility

Standard focus pattern for all interactive elements:

```
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none
```

- Always `focus-visible:`, never `focus:`.
- Never `outline-none` without a `ring-*` replacement.
- Tab order follows visual order — no `tabindex` > 0.

---

## Component Conventions

> **shadcn audit rule:** Consult the `/shadcn` skill before writing/editing shadcn components. Run `npx shadcn@latest docs <component>` to confirm API. Verify: `gap-*` not `space-*`, proper composition, semantic colors, correct icon usage. Forms use `FieldGroup` + `Field`, `data-invalid`/`aria-invalid` for validation. This project uses **`base`** (not `radix`) — use `render` not `asChild`, scalar `defaultValue` on `Slider`, `items` prop on `Select`.

### Buttons

shadcn `<Button>`, always `rounded-full`.

| Variant | Use | Appearance |
|---------|-----|------------|
| `default` | Primary CTA | Sage bg, warm white text |
| `outline` | Secondary action | Plum border/text, transparent bg |
| `ghost` | Tertiary | No bg, soft purple text |
| `secondary` | Blush-toned | Blush bg, plum text |
| `link` | Inline link | Sage text, underline on hover |

### Cards

shadcn `<Card>` or `div` with `rounded-2xl bg-card text-card-foreground p-6 shadow-sm`. Fraunces title, Nunito body. Colored dots (sage/plum/blush) for categories.

### Navigation

- **Desktop (`lg:+`):** Pill nav — `rounded-full bg-card max-w-6xl mx-auto` + plum-tinted shadow. Logo: Fraunces/plum left. Links: Nunito/soft-purple right, `hover:text-primary`. Fixed top `z-50`.
- **Mobile (below `lg:`):** Hamburger (44px target) → slide-in drawer, `rounded-2xl bg-card`, stacked links `py-3`. Close on link click or outside tap.

### Forms

shadcn `<Input>`, `<Select>`, `<Textarea>`. All `rounded-lg`, `--border` lavender border, sage focus ring. Labels: Nunito semibold, plum. Helper text: Nunito regular, soft purple, `text-sm`.

### Data Display

- Stat numbers: Fraunces semibold, large, sage or plum. Labels: Nunito, soft purple.
- Tables: minimal `--border` borders, zebra stripe with `bg-muted`.
- Charts: use `--chart-*` variables.

### Icons

Lucide React. `w-5 h-5` inline, `w-8 h-8`–`w-12 h-12` for features. Always `currentColor`. Default stroke; `strokeWidth={1.5}` for large decorative icons.

### Images

`rounded-2xl` standard, `rounded-3xl` hero/feature. Meaningful `alt` (decorative: `alt=""`). `object-cover` for hero images.

---

## UI States

### Empty States

Centered layout: Lucide icon (`w-12 h-12 text-muted-foreground`) + Fraunces heading + Nunito body + CTA button. `bg-muted` or `bg-secondary`, `rounded-2xl p-8`. Tone: encouraging ("No donations yet — be the first to give today.").

### Loading States

Skeleton screens over spinners. `bg-muted rounded-lg motion-safe:animate-pulse`. Match skeleton shape to content (cards `rounded-2xl`, text `rounded h-4`).

### Error States

`--destructive` as border/icon accent, not full background. Warm, blame-free copy with recovery action. Inline validation: `text-destructive text-sm` + `AlertCircle` icon below input.

### Success States

Sage accent + checkmark. Auto-dismiss 3–4s or clear next step. Celebratory but measured.

---

## WCAG Contrast (AA Normal — all pass)

| Pair | Ratio |
|------|-------|
| Soft Purple on Lavender | 7.23:1 |
| Plum on Cream | 11.02:1 |
| Warm White on Sage | 4.97:1 |
| Warm White on Plum | 11.21:1 |
| Soft Purple on Blush | 6.25:1 |
| Plum on Lavender | 10.21:1 |
| Sage on Lavender | 4.53:1 |
| Sage on Cream | 4.88:1 |
| Soft Purple on Cream | 7.80:1 |
| Warm White on Destructive | 4.56:1 |
| Plum on Blush | 8.83:1 |
| Plum on Muted Lavender | 9.62:1 |
| Soft Purple on Muted Lavender | 6.81:1 |
