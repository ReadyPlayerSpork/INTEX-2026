# Accessibility and responsiveness — evidence workflow

## Purpose

Course rubrics often expect **measured** accessibility, not only responsive CSS. This file records how to generate evidence and where to store scores.

## Recommended process

1. Run the production or preview build (`npm run build` then `npm run preview`, or the deployed URL).
2. Open Chrome DevTools → **Lighthouse** → Categories: **Accessibility** (and **Best practices** if required).
3. Test key routes at a mobile viewport (e.g. 390×844):

   - `/` (home)
   - `/impact`
   - `/donate`
   - `/login`
   - One authenticated portal (e.g. `/donor/dashboard` or `/financial/dashboard`)

4. Save HTML or PDF reports if your course requires artifacts; optionally attach screenshots of the Lighthouse summary panel.

## Baseline fixes in the codebase

- `PublicLayout` includes a **skip to main content** link for keyboard users.
- Prefer visible labels on form controls; use `aria-label` only when a visible label is impossible.
- Tables use `overflow-x-auto` wrappers on small screens where applicable.

## Updating this document

After each audit pass, append a row:

| Date | Route | Viewport | A11y score | Notes |
|------|-------|----------|------------|-------|
| _TBD_ | / | mobile | _run Lighthouse_ | |
