# Haven for Her Frontend (React + Vite)

This frontend uses **React + TypeScript + Vite**, styled with **Tailwind CSS + shadcn/ui**.

## Stack

- **CSS**: Tailwind CSS (via `@tailwindcss/vite`) + shadcn/ui (`components.json`, `src/components/ui/*`)
- **Path alias**: `@/*` points to `src/*` (TypeScript + Vite)

## Commands

From `frontend/Haven-for-Her/`:

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Notes

- shadcn/ui setup is tracked in `components.json`. To add components: `npx shadcn@latest add <component>`.
- Global styles + design tokens live in `src/index.css`.
