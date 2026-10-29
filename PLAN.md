# SafeVoice roadmap

SafeVoice is a privacy-first emergency assistant and private crime-reporting platform. The product is delivered in milestones so each one is usable and testable on its own. Every milestone keeps a clearly labeled **demo mode** that never sends real alerts.

Platform choices: Netlify Identity (accounts and roles), Netlify Database with Drizzle ORM (structured records), Netlify Blobs (private evidence files), Netlify Functions / TanStack Start server functions (all server logic and provider credentials).

## Milestone 1 — Product surface ✅
- Branded landing page with hero, three CTAs, six feature cards, setup steps, honesty section, and footer (safety info, privacy, contact).
- Live Safety Dashboard: on-device keyword detection (Web Speech API) with explicit mic permission and error states; manual SOS with 10-second countdown, cancel, and false-alarm handling; consent-based GPS with lat/long/accuracy, map, and stop sharing; trusted contacts add/edit/remove with validation; alert history with honest delivery badges.
- Report a Crime: validated complaint form (category, date, time, location, description, evidence picker), reference numbers, private history with search, filters, and status timeline.
- Setup Guide with FAQ.
- All data comes from `src/lib/fixtures.ts` and lives in browser memory.

## Milestone 2 — Accounts and authorization
- Netlify Identity: register, login, logout, password reset (recovery link), email confirmation.
- Protected routes for dashboard, report, and profile; redirect to login when signed out.
- `admin` role via Identity app_metadata; server-side role checks helper.
- Profile & emergency settings page (display name, keyword, countdown length, default sharing preference).

## Milestone 3 — Data model and persistence
- Drizzle schema in `db/schema.ts`: `profiles`, `emergency_contacts`, `emergency_alerts`, `complaints`, `complaint_updates`, `notification_deliveries`, `audit_logs`.
- Server functions that always scope queries by the authenticated user id (authorization enforced on the server, the equivalent of row-level security). Admin queries require the admin role.
- Zod validation shared by client and server.
- Replace fixtures with real loaders/mutations; keep fixtures for demo mode.

## Milestone 4 — Evidence storage
- Upload evidence to a private Netlify Blobs store keyed by user and complaint; type/size validation on the server.
- Download only through an authorized server endpoint (owner or admin); never public URLs.

## Milestone 5 — Emergency notifications
- Server-side notification service with pluggable providers (e.g. Twilio for SMS, Resend/Postmark for email). **Requires external credentials** set as Netlify environment variables.
- Alert payload: type, timestamp, and location only if the user shared it.
- Record each delivery attempt in `notification_deliveries`; show *Delivered* only after the provider confirms (status webhooks), otherwise *Queued* / *Failed* with the error.
- Global demo-mode switch (`SAFEVOICE_DEMO_MODE`) that short-circuits every send.

## Milestone 6 — Admin console
- Role-protected `/admin` route: active alerts list, incident map, timestamps and delivery statuses.
- Acknowledge / assign / resolve actions; complaint management table with search, filters, and status updates that append to the complaint timeline.
- Audit log of every administrative action (actor, action, target, time).
- Near-real-time updates via polling of a lightweight server endpoint (upgrade path: server-sent events).

## Milestone 7 — Testing and hardening
- Vitest + Testing Library: keyword normalization/matching, SOS countdown cancel/false alarm, contact validation, complaint validation, geolocation denial handling (mocked APIs).
- Server tests for per-user scoping and admin-only access.
- Accessibility pass, rate limiting on alert and complaint endpoints, deployment guide and environment checklist in README.
