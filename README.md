# VitalTag

Emergency medical passport. Scan a QR with no login → get crash data
(blood group, allergies, conditions, ICE contacts). Authenticated
clinicians get the full clinical record. QR encodes only a random token,
never medical data. Full proposal: `VitalTag_Executive_Proposal_HatchPoint.docx`.

## Stack

Next.js 16 (App Router, TypeScript) + Supabase (Postgres, Auth, RLS,
Realtime) + Tailwind v4.

## Access model

| Tier | Who | How |
|---|---|---|
| 1 — Crash data | Anyone with the QR token | `get_emergency_snapshot()` RPC, logs every call |
| 2 — Full ledger | Clinicians / admins, authenticated | RLS on `clinical_records` |

## Setup

**Don't create a new Supabase project — this uses a shared one.** Ask the
project owner for the URL + anon key, then:

```bash
cp .env.local.example .env.local   # paste in the two values you were given
npm install
npm run dev
```

Schema's already applied there. Adding a migration? Tell the owner so it
gets run on the shared project too.

## Project layout

```
src/
  app/
    page.tsx, login/, signup/     redesigned (brand styling)
    dashboard/, terminal/,
    emergency/[token]/            NOT redesigned (raw defaults)
    globals.css                   brand tokens + self-hosted Fraunces
  components/                     SiteHeader/Footer, PassportQr, PassportCardMock
  lib/
    actions/                      Server Actions: auth.ts, passport.ts
    supabase/                     client.ts, server.ts, middleware.ts, types.ts
  proxy.ts                        session refresh + route guard
supabase/migrations/0001_init.sql  schema, RLS, RPCs, triggers
```

## Design system

- Brand colors: myrtle `#217868` (text/buttons) on cream `#E5DABE` (bg) —
  tokens in `globals.css`.
- Fraunces (display font) is self-hosted in `public/fonts/`, not
  `next/font/google` — that path had an intermittent Turbopack bug.
- Only `/`, `/login`, `/signup` are redesigned so far.

## Status

**Open bug:** creating a passport on `/dashboard` silently fails — no
passport, no error. Not root-caused yet; check the browser Network/Console
tabs next.

**Not built:** Tier 2 write UI, pharmacy module, camera QR scan,
admin-gated clinician signup, realtime sync, PWA icons, tests.

**Known issues:** `check_allergy_contraindication` RPC has no
caller-authorization check (any user can query any passport's allergies) ·
`passports.user_id` has no unique constraint · `lucide-react`/`zod`
installed but unused · `Logo.tsx` unused.

## Conventions

- Mutations are Server Actions (`lib/actions/`), not API routes.
- Schema changes are new migration files — never edit `0001_init.sql`.
- On failure, redirect with `?error=` — a thrown error in a form action has
  no visible UI feedback.
