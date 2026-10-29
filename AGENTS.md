# AGENTS.md

Guide for developers and AI agents working on SafeVoice. **Continue from [PLAN.md](PLAN.md)** — Milestone 1 (product surface) is done; start at the first unchecked milestone.

## Product

SafeVoice: voice-activated emergency alerts, consent-based GPS sharing, trusted-contact notifications, and private crime-complaint reporting with status tracking. An admin console is planned. Trust and honesty are product requirements:

- Never show "Delivered" unless a provider confirmed it. Demo deliveries show "Demo mode — not sent".
- Never read location without an explicit user action; always offer "Stop sharing".
- Never record or upload audio/transcripts. Keyword matching happens in memory in `useVoiceKeyword`.
- Never claim police integration.
- Keep the demo-mode banner (`DemoBanner` in `site-chrome.tsx`) until real delivery is configured and tested.

## Stack

TanStack Start + React 19 + TypeScript (strict, unused locals fail), Tailwind CSS 4, shadcn/ui in `src/components/ui`, lucide-react, zod, sonner toasts. Deployed on Netlify via `@netlify/vite-plugin-tanstack-start`.

Backend choices for upcoming milestones: Netlify Identity (`@netlify/identity`), Netlify Database (`@netlify/database` + Drizzle, schema in `db/schema.ts`), Netlify Blobs for evidence files, server functions for all provider calls. Read the matching skill before implementing.

## Layout

```
src/
  components/
    site-chrome.tsx       # Logo, DemoBanner, SiteHeader (desktop nav + mobile Sheet), SiteFooter
    contacts-manager.tsx  # Contact list + add/edit dialog, zod contactSchema (phone/email rules)
    ui/                   # shadcn components (restyle via theme vars, don't fork)
  hooks/
    use-voice-keyword.ts  # Web Speech API wrapper: explicit getUserMedia permission, auto-restart, error messages
    use-geolocation.ts    # watchPosition wrapper with start/stop and denial/timeout messages
  lib/
    fixtures.ts           # ALL demo data + shared domain types (swap for DB loaders in Milestone 3)
  routes/
    index.tsx             # Landing page
    dashboard.tsx         # Live Safety Dashboard (SOS countdown dialog, voice, GPS map, contacts, history)
    report.tsx            # Complaint form + history (search/filter/timeline)
    guide.tsx             # Setup guide + FAQ
  styles.css              # Theme: dark navy base, --sv-blue/purple/red/green/amber accents, sv-* utilities, keyframes
```

## Conventions

- The app is dark-only: `<html class="dark">` and `:root` holds the dark palette. Use theme classes (`bg-card`, `text-muted-foreground`) and accent classes (`text-sv-red`, `bg-sv-purple/15`). Panels use `.sv-glass`; page backgrounds use `.sv-backdrop`.
- Headings use `font-display` (Sora); body is DM Sans (loaded in `__root.tsx`).
- Every page renders `SiteHeader` + `SiteFooter` and uses `max-w-content px-4 sm:px-6`.
- Animations must include `motion-reduce:` fallbacks.
- Read `localStorage` only in `useEffect` (SSR). Locale-formatted dates rendered on the server need `suppressHydrationWarning`.
- Forms validate with zod and show inline errors linked via `aria-describedby`.
- The SOS countdown lives in `dashboard.tsx` (`COUNTDOWN_SECONDS`); `pendingRef` prevents repeat voice triggers from resetting it.

## Commands

`pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm typecheck` (run dev/build once first to generate `routeTree.gen.ts`).
