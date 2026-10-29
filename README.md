# SafeVoice — Hidden Crime Reporting & Women Safety

SafeVoice helps women and other vulnerable people raise an alarm quietly and report crimes privately. Say a private keyword (or tap SOS) to start an emergency alert that includes your live location for trusted contacts, and file harassment, stalking, or threat complaints that you can track by reference number.

> **Demo mode.** This build never sends real alerts, SMS, or emails. Voice detection and GPS run for real in your browser; contacts, alerts, and complaints are fictional fixtures held in memory. SafeVoice is not connected to any police service.

## What works today

| Screen | Route | Status |
| --- | --- | --- |
| Landing page | `/` | Live |
| Live Safety Dashboard (voice keyword, SOS countdown, GPS + map, contacts, alert history) | `/dashboard` | Live in demo mode |
| Report a Crime + private complaint history | `/report` | Live in demo mode |
| Setup Guide + FAQ | `/guide` | Live |

### Features that need configuration before they are operational

- **SMS and email alerts** — need a notification provider (e.g. Twilio, Resend); see `.env.example`. Not built yet.
- **Accounts, password reset, roles** — Netlify Identity (Milestone 2).
- **Persistent records** — Netlify Database (Milestone 3); **evidence storage** — Netlify Blobs (Milestone 4).
- **Admin dashboard** — Milestone 6.
- **Voice detection** — needs a browser with the Web Speech API (Chrome, Edge, Safari). Chrome processes speech on Google's servers; SafeVoice itself never stores or uploads audio or transcripts.
- **Map** — tiles come from OpenStreetMap and are only requested once you choose to share location.

## Tech stack

TanStack Start (React 19, TypeScript, file-based routing) · Tailwind CSS 4 · shadcn/ui (Radix) · lucide icons · Zod · Netlify hosting. Planned: Netlify Identity, Netlify Database (Postgres + Drizzle), Netlify Blobs, Netlify Functions.

## Run locally

```bash
pnpm install
netlify dev      # or: pnpm dev (Vite on port 3000)
```

Microphone and location APIs require a secure context: `localhost` or HTTPS.

## Deploy

The project is connected to Netlify; pushing to `main` builds with `vite build` and publishes `dist/client` (see `netlify.toml`). Copy variables from `.env.example` into the Netlify project's environment settings when the notification milestone lands.

## Roadmap

See [PLAN.md](PLAN.md): accounts and roles → database schema with per-user authorization → private evidence storage → SMS/email notifications with confirmed delivery status → admin console with audit log → tests and hardening.
