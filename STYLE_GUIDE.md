# Haven for Her — Style Guide

This is the canonical design reference for the Haven for Her frontend. All agents and contributors must follow these conventions when building UI. The design is based on the **Bloom** theme — soft, organic, and nurturing. It should feel like a safe space: warm, approachable, and human.

> **Implementation rule:** Use **Tailwind utility classes** and **shadcn/ui components** for all styling. Do not write custom CSS, inline `style={{ }}` attributes, `@apply` blocks, or CSS modules — not in `index.css`, not in component files, not in overrides. The only CSS in `index.css` should be `@import`, `@theme`, and `:root` variable definitions. If a design need cannot be met with Tailwind classes, extend the theme via CSS custom properties in `:root` — never with one-off stylesheets.

### Companion documents

| File | Location | Purpose |
|------|----------|---------|
| **`.impeccable.md`** | Project root | Design context — target audiences, brand personality, emotional goals by user type, aesthetic direction, anti-references, and the 5 core design principles. Read this first for the "why" behind every decision in this guide. |
| **`CLAUDE.md`** | Project root | Agent onboarding — tech stack, commands, architecture, key files, and the "keep guidance up to date" policy. |
| **`BUILDPROMPT.md`** | Project root | Feature roadmap — phased deliverables and acceptance criteria. |

---

## Brand Personality

Haven for Her helps sexual assault survivors in underserved urban US communities. The UI must feel:

- **Safe and nurturing** — never clinical, corporate, or sterile
- **Warm and organic** — soft shapes, natural colors, gentle transitions
- **Trustworthy and dignified** — professional without being cold
- **Hopeful** — the palette and tone lean forward, not backward

The aesthetic is "wellness center meets compassionate nonprofit." Think therapy office waiting room, not hospital. Think community garden, not government building.

---

## Color Palette

All CSS values use **oklch** for perceptual uniformity. The hex column is a human-readable reference only — always use the oklch values in code.

### Semantic Roles

| Role | Color Name | Hex (ref) | oklch | Usage |
|------|-----------|-----------|-------|-------|
| **Page background** | Lavender | `#F3EFF8` | `oklch(0.958 0.013 306)` | Default page/section background. Soft purple-tinted white. |
| **Primary action** | Sage | `#4E7842` | `oklch(0.528 0.094 139)` | Buttons, links, positive indicators, CTA backgrounds. The "do this" color. |
| **Headings & emphasis** | Plum | `#4A2C5E` | `oklch(0.354 0.090 310)` | All headings, bold labels, nav logo, dark section backgrounds (footer, CTA). |
| **Body text** | Soft Purple | `#5E4570` | `oklch(0.435 0.075 310)` | Paragraphs, descriptions, secondary labels. Never use gray — always this warm purple. |
| **Card surfaces** | Cream | `#FFF8F3` | `oklch(0.983 0.010 58)` | Cards, nav bar, elevated containers. The "paper" surface. |
| **Warm accent** | Blush | `#F0DDD5` | `oklch(0.911 0.024 44)` | Testimonial backgrounds, decorative elements, secondary card variant. Warm and gentle. |
| **Text on dark** | Warm White | `#FDFBF8` | `oklch(0.989 0.005 78)` | Text placed on plum or sage backgrounds. Never use pure `#fff`. |

### Mapping to shadcn / Tailwind CSS Variables

Replace the default shadcn `:root` in `src/index.css` with the Bloom palette. Also **remove the `.dark` block and `@custom-variant dark`** — this app is light-mode only.

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

- **Never use pure gray** (`#888`, `#ccc`, `slate-500`, etc.). Body text is soft purple. Borders are tinted lavender. Muted text is the same soft purple at reduced weight, not a gray.
- **Never use pure black** (`#000`) or **pure white** (`#fff`). Use plum for the darkest value, warm white for the lightest.
- **Accent color sparingly.** Sage is the primary action color. It should appear on CTAs, active states, and positive indicators — not everywhere. Follow the 60-30-10 principle: 60% lavender/cream surfaces, 30% plum/soft-purple text, 10% sage accents.
- **Blush is a surface, not text.** Use blush as a background for testimonials, highlighted cards, or decorative areas. Do not use it for text or borders.

### Surface Stacking

Not every surface color works on every background. Follow these pairings:

| Surface | Allowed backgrounds | Notes |
|---------|-------------------|-------|
| Cream card | Lavender, Plum | Primary card pattern. High contrast on both. |
| Blush card | Lavender | Accent card. Warm contrast against cool lavender. |
| Cream card | Blush section | Works for nested content inside a blush feature area. |
| **Never** | Blush on Cream | Too similar — surfaces blur together. |
| **Never** | Cream on Cream | No visible elevation difference. |
| **Never** | Lavender on Blush | Cool-on-warm clash with insufficient contrast. |

---

## Typography

### Font Stack

| Role | Font | Fallback | Tailwind Class |
|------|------|----------|---------------|
| **Headings** (h1–h4, logo, pull-quotes) | Fraunces | Georgia, serif | `font-heading` |
| **Body** (paragraphs, labels, buttons, nav) | Nunito | system-ui, sans-serif | `font-body` |

Both fonts are loaded from Google Fonts via `<link>` in `index.html`. To make them available as Tailwind classes, add the following to the `@theme inline` block in `index.css`:

```
--font-heading: "Fraunces", Georgia, serif;
--font-body: "Nunito", system-ui, sans-serif;
--font-sans: "Nunito", system-ui, sans-serif;
```

Then reference them as `font-heading`, `font-body`, or the default `font-sans` in Tailwind classes.

### Hierarchy

| Element | Font | Weight | Tailwind Size | Notes |
|---------|------|--------|---------------|-------|
| Page headline (h1) | Fraunces | semibold (600) | `text-4xl md:text-5xl lg:text-6xl` | Only one per page. Color: plum. |
| Section heading (h2) | Fraunces | semibold (600) | `text-3xl md:text-4xl` | Color: plum. |
| Card / sub heading (h3) | Fraunces | semibold (600) | `text-lg md:text-xl` | Color: plum. |
| Body text | Nunito | regular (400) | `text-base md:text-lg` | Color: soft purple. `leading-relaxed`. |
| Small / caption | Nunito | regular (400) | `text-sm` | Color: soft purple. |
| Button text | Nunito | semibold (600) | `text-sm md:text-base` | Color depends on variant. |
| Nav links | Nunito | regular (400) | `text-sm md:text-base` | Color: soft purple. |
| Stat numbers | Fraunces | semibold (600) | `text-3xl md:text-5xl` | Color: sage or plum. |

### Typography Rules

- **Fraunces is only for headings, stats, pull-quotes, and the logo.** Never for body text, form labels, or UI chrome.
- **Nunito is the default for everything else.** Set it as the base `font-sans` so shadcn components inherit it automatically.
- **Use `text-balance`** on headlines and **`text-pretty`** on body paragraphs when using Tailwind's text-wrap utilities.
- **Max reading width:** Body text blocks should use `max-w-xl` to `max-w-2xl` (roughly 45–65 characters per line).

---

## Shape & Spacing

### Border Radius

The design is organic and rounded. Avoid sharp corners everywhere.

| Element | Radius | Tailwind Class |
|---------|--------|---------------|
| Buttons | fully round | `rounded-full` |
| Cards | large | `rounded-2xl` |
| Featured containers (hero image, testimonial) | extra-large | `rounded-3xl` |
| Inputs, selects | medium | `rounded-lg` |
| Badges, pills | fully round | `rounded-full` |
| Modals / dialogs | large | `rounded-2xl` |

### Spacing Rhythm

Use Tailwind's default spacing scale. Prefer generous padding — the design should breathe.

- **Section vertical padding:** `py-16 md:py-24` (standard) or `py-20 md:py-28` (feature/CTA)
- **Section horizontal padding:** `px-4 md:px-6` with `max-w-6xl mx-auto` content container
- **Card internal padding:** `p-6 md:p-7`
- **Gap between cards/grid items:** `gap-4` to `gap-6`
- **Vertical gap between elements inside a card:** `gap-3`
- **Between heading and body text:** `mb-5` to `mb-6`

### Shadows

Shadows should be soft and tinted, not harsh gray defaults.

- **Card shadow:** `shadow-sm` or the tinted variant `shadow-[0_4px_24px_rgba(74,44,94,0.03)]` for subtle plum-tinted depth.
- **Nav shadow:** `shadow-[0_2px_12px_rgba(74,44,94,0.08)]` (plum-tinted medium shadow).
- **Never use** heavy `shadow-lg` or `shadow-xl` on cards. Keep things soft. The design relies on color contrast between surfaces (lavender vs cream), not drop shadows.

---

## Motion & Transitions

The design uses **moderate** motion — enough to feel alive, never enough to distract or overwhelm.

### Defaults

| Context | Duration | Easing | Tailwind |
|---------|----------|--------|----------|
| Hover / focus color change | 150ms | ease-out | `transition-colors duration-150` |
| Card hover lift | 200ms | ease-out | `transition-transform duration-200` |
| Page section entrance | 500ms | ease-out (quart) | `motion-safe:animate-fade-up` |
| Modal / popover open | 200ms | ease-out | `transition-all duration-200` |

### Rules

- **Wrap all animation in `motion-safe:`** so users with `prefers-reduced-motion` see no movement. Example: `motion-safe:transition-transform motion-safe:duration-200`.
- **Only animate `transform` and `opacity`.** Never animate `width`, `height`, `padding`, `margin`, or other layout properties.
- **Easing:** Use `ease-out` or `cubic-bezier(0.33, 1, 0.68, 1)` (exponential deceleration). Never use `bounce`, `elastic`, or spring easing.
- **Hover states** use color transitions (`transition-colors`), not opacity changes. No `hover:opacity-*`.
- **Scroll-triggered entrances** should be subtle — fade up 8–12px with opacity 0 to 1. Stagger sibling elements by 75–100ms.
- **No auto-playing animation loops.** Nothing should move unless the user triggered it or the page is loading.

---

## Focus & Keyboard Accessibility

### Focus Ring

All interactive elements must show a visible focus indicator when navigated via keyboard.

| Property | Value | Tailwind |
|----------|-------|----------|
| Ring color | Sage (primary) | `ring-ring` |
| Ring width | 2px | `ring-2` |
| Ring offset | 2px, background color | `ring-offset-2 ring-offset-background` |
| Trigger | Keyboard only | `focus-visible:` prefix |

Standard focus pattern for interactive elements:

```
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none
```

### Rules

- **Always use `focus-visible:` not `focus:`** — mouse users should not see focus rings.
- **Never remove outline without replacing it.** `outline-none` is only acceptable when paired with a visible `ring-*` alternative.
- **Tab order must follow visual order.** Do not use `tabindex` values greater than 0.

---

## Component Conventions

### Buttons

Use the shadcn `<Button>` component. All buttons in this design are `rounded-full` (pill-shaped).

| Variant | When to Use | Appearance |
|---------|-------------|------------|
| `default` | Primary CTA ("Donate Now", "Give Today") | Sage bg, warm white text |
| `outline` | Secondary action ("Learn More") | Plum border, plum text, transparent bg |
| `ghost` | Tertiary / text-like actions | No bg, soft purple text, subtle hover |
| `secondary` | Blush-toned actions | Blush bg, plum text |
| `link` | Inline text links | Sage text with underline on hover |

### Cards

Use the shadcn `<Card>` component or a `<div>` with `rounded-2xl bg-card text-card-foreground p-6 shadow-sm`.

- Default cards sit on cream with plum text.
- Use Fraunces for the card title, Nunito for the body.
- Colored indicator dots (sage, plum, blush) can mark card categories.

### Navigation

**Desktop (`lg:` and above):**
- Pill-shaped container: `rounded-full bg-card max-w-6xl mx-auto` with `shadow-[0_2px_12px_rgba(74,44,94,0.08)]`.
- Logo in Fraunces, plum color, left side.
- Links in Nunito, soft purple, right side. Hover: `hover:text-primary transition-colors duration-150`.
- Fixed to top: `fixed inset-x-0 top-0 z-50`.

**Tablet and mobile (below `lg:`):**
- Hamburger icon button (right side), minimum `44px` touch target.
- Opens a slide-in drawer or dropdown panel with `rounded-2xl bg-card shadow-lg`.
- Nav links stacked vertically, `py-3` each for comfortable touch targets.
- Close on link click or outside tap.

### Forms & Inputs

- Use shadcn `<Input>`, `<Select>`, `<Textarea>` components.
- All inputs: `rounded-lg` (not rounded-full — that's only for buttons and badges).
- Border: the `--border` variable (tinted lavender).
- Focus ring: sage (`--ring`), using the focus-visible pattern above.
- Labels: Nunito semibold, plum color.
- Helper text: Nunito regular, soft purple, `text-sm`.

### Data Display (Stats, Tables, Metrics)

- Stat numbers use Fraunces semibold at large sizes, colored sage or plum.
- Stat labels use Nunito regular, soft purple.
- Tables: minimal borders, use the `--border` lavender tint. Zebra striping with `bg-muted` on alternating rows.
- Charts use the `--chart-*` variables mapped to the Bloom palette (see `:root` block above).

### Icons

- **Library:** Lucide React (`lucide-react`, already installed).
- **Sizes:** `w-5 h-5` inline with text, `w-8 h-8` to `w-12 h-12` for feature/section icons.
- **Color:** Always `currentColor` — icons inherit text color, never hard-coded.
- **Stroke width:** Default (2) for most uses. `strokeWidth={1.5}` for larger decorative icons.

### Images

- Border radius: `rounded-2xl` for standard images, `rounded-3xl` for hero/feature images.
- Always include meaningful `alt` text. Decorative images get `alt=""`.
- Use `object-cover` for hero/feature images to prevent distortion.
- Prefer warm, organic photography. Avoid generic stock photos with forced smiles.

---

## UI States

Every interactive view has states beyond the happy path. Agents must handle these consistently.

### Empty States

An empty state is a teaching moment. Never just say "Nothing here."

- Layout: centered icon (Lucide, `w-12 h-12 text-muted-foreground`) + heading (Fraunces, plum) + body text (Nunito, soft purple) + primary CTA button.
- Background: `bg-muted` or `bg-secondary` with `rounded-2xl p-8`.
- Tone: encouraging, forward-looking. "No donations yet — be the first to give today."

### Loading States

- Prefer **skeleton screens** over spinners. Skeletons use `bg-muted rounded-lg animate-pulse`.
- Match the skeleton shape to the content it replaces (card skeletons are `rounded-2xl`, text skeletons are `rounded h-4`).
- Wrap skeletons in `motion-safe:animate-pulse` so reduced-motion users see a static placeholder.

### Error States

- Use `--destructive` as a border or icon accent, not as a full background.
- Copy is warm and blame-free: "Something went wrong" not "Error 500." Always include a recovery action ("Try again", "Go back").
- Inline validation errors appear below the input in `text-destructive text-sm` with a Lucide `AlertCircle` icon.

### Success States

- Brief confirmation with a sage accent (checkmark icon, success message).
- Either auto-dismiss after 3–4 seconds or provide a clear next step.
- Tone: celebratory but not over-the-top. "Thank you for your gift" not "AMAZING! You're a hero!"

---

## Tone of Voice (UX Copy)

- **Warm, direct, human.** "We're here for you" not "Services are available."
- **Empowering, never pitying.** Survivors are strong people rebuilding, not victims to be rescued.
- **Concise.** Every word earns its place. Avoid filler paragraphs.
- **Action-oriented CTAs:** "Give Today", "Support a Survivor", "Join Us" — not "Submit", "Click Here", or "Proceed."
- **Sensitive to context.** Data involving survivors is presented with dignity. Labels say "Residents" or "Program Participants," never raw clinical terms in the UI.

---

## Do Not

These are the most common ways to break the design. Agents must avoid all of them.

1. **Do not use inline `style={{ }}` for colors or fonts.** Use Tailwind classes that reference the theme variables (`text-foreground`, `bg-primary`, `font-heading`, etc.).
2. **Do not use gray.** No `text-gray-500`, no `bg-slate-100`, no `border-gray-200`. Every neutral in this design is tinted toward the purple/warm family via the theme variables.
3. **Do not use sharp corners.** Everything is rounded — `rounded-full` for buttons/pills, `rounded-2xl` for cards, `rounded-3xl` for featured areas.
4. **Do not add custom CSS files, `@apply` blocks, or CSS modules.** Not in `index.css`, not in component files, not in overrides. Style exclusively with Tailwind utility classes. The only CSS in `index.css` is `@import`, `@theme`, and `:root` variable definitions.
5. **Do not use dark mode.** The app is light-palette only. Remove the `.dark` block and `@custom-variant dark` from `index.css` when applying this palette. Do not add `dark:` variants to components.
6. **Do not use generic sans-serif for headings.** All headings (h1–h4) must use `font-heading` (Fraunces). Body text uses `font-body` / `font-sans` (Nunito).
7. **Do not center everything.** Prefer left-aligned body text. Center alignment is reserved for hero headlines, CTAs, and stat displays.
8. **Do not use heavy shadows or elevation.** Shadows should be `shadow-sm` or very subtle tinted shadows. The design relies on color contrast between surfaces (lavender vs cream), not drop shadows.
9. **Do not use `hover:opacity-*` for interactive states.** Use color-based transitions (`hover:text-primary`, `hover:bg-muted`) instead.
10. **Do not remove focus indicators.** Every interactive element must have a visible `focus-visible:ring-*` state. Never use `outline-none` without a ring replacement.

---

## WCAG Contrast Verification

Every color pairing in this guide has been tested against WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text). All pairs pass AA normal.

| Pair | Ratio | AA Normal |
|------|-------|-----------|
| Body text (Soft Purple) on Lavender | 7.23:1 | Pass |
| Plum on Cream (card headings) | 11.02:1 | Pass |
| Warm White on Sage (CTA buttons) | 4.97:1 | Pass |
| Warm White on Plum (dark sections) | 11.21:1 | Pass |
| Soft Purple on Blush | 6.25:1 | Pass |
| Plum on Lavender | 10.21:1 | Pass |
| Sage on Lavender (links) | 4.53:1 | Pass |
| Sage on Cream (links on cards) | 4.88:1 | Pass |
| Soft Purple on Cream | 7.80:1 | Pass |
| Warm White on Destructive Red | 4.56:1 | Pass |
| Plum on Blush | 8.83:1 | Pass |
| Plum on Muted Lavender | 9.62:1 | Pass |
| Soft Purple on Muted Lavender | 6.81:1 | Pass |

---

## Reference: Full Palette

For quick human lookup only. Use the oklch values in all CSS.

```
Lavender      #F3EFF8    oklch(0.958 0.013 306)    Page background
Sage          #4E7842    oklch(0.528 0.094 139)    Primary / CTAs
Blush         #F0DDD5    oklch(0.911 0.024 44)     Warm accent surface
Plum          #4A2C5E    oklch(0.354 0.090 310)    Headings / dark sections
Soft Purple   #5E4570    oklch(0.435 0.075 310)    Body text
Cream         #FFF8F3    oklch(0.983 0.010 58)     Card / nav surface
Warm White    #FDFBF8    oklch(0.989 0.005 78)     Text on dark backgrounds
Muted Lav     #EDE8F3    oklch(0.938 0.016 306)    Muted backgrounds
Border Lav    #E2DAF0    oklch(0.901 0.031 302)    Borders and input outlines
Warm Red      #C24D4D    oklch(0.575 0.151 23)     Destructive actions
Blend         #8B7BA0    oklch(0.611 0.058 304)    Chart accent (sage-plum)
```
