# Evo2027 Tracker — Project Notes

## Stack
- Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4
- Auth.js (next-auth v5 beta) with Credentials provider
- Drizzle ORM + Neon (PostgreSQL)
- No UI component libraries — Tailwind only

## Key Files
- `auth.ts` — exports `{ handlers, signIn, signOut, auth }`
- `lib/db.ts` — Drizzle DB client
- `lib/schema.ts` — `users`, `budget`, `savings`, `kanbanCard` tables (numeric → string in drizzle)
- `app/globals.css` — Tailwind v4 import + `floatUp` keyframe for bill animation
- `app/layout.tsx` — Root layout with footer ("jupi-ter" + year)
- `app/_components/CurrencyAmount.tsx` — shared client component for locale currency formatting
- `app/page.tsx` — Landing page (server component, uses `auth()` + DB directly)
- `app/login/page.tsx` — Login form (client, uses `signIn` from `next-auth/react`)
- `app/budget/page.tsx` + `BudgetClient.tsx` — Budget backoffice, optimistic updates
- `app/savings/page.tsx` + `SavingsClient.tsx` — Savings page with bill animation
- `app/budget/loading.tsx` + `app/savings/loading.tsx` — Skeleton loading states
- `app/kanban/page.tsx` + `KanbanClient.tsx` — Shared kanban board (no userId), HTML5 DnD, optimistic updates
- `app/api/kanban/route.ts` — GET/POST/PATCH/DELETE; DELETE is soft-delete (sets deletedAt)

## Design System (Neobrutalism)
- Borders: `border-2 border-black` or `border-4 border-black`
- Shadow: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` (or 6px/8px for cards)
- Hover effect: `hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`
- Colors: yellow-300 (main bg), pink-400 (budget/delete), green-400 (savings/add), white (cards)
- No rounded corners; `font-black` for headings, `font-bold` for labels

## Patterns
- Protected pages: call `auth()` in server component, `redirect('/login')` if no session
- Sign-out: server action with `'use server'` + `signOut({ redirectTo: '/' })`
- Currency: `Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD' })` in client component with `suppressHydrationWarning`
- Optimistic UI: update local state immediately, `router.refresh()` after API call
- Bill animation: CSS `@keyframes floatUp` in globals.css, triggered by spawning fixed-position SVG elements via React state
- Tailwind v4 CSS import: `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- `numeric` Postgres columns come through Drizzle as `string` — always `parseFloat()`
