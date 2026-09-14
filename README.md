# VitalTag

Dynamic emergency medical passport and clinical triage infrastructure. See
`VitalTag_Executive_Proposal_HatchPoint.docx` for the full product proposal.

## Stack

- **Next.js (App Router, TypeScript)** — single responsive app serving three
  surfaces: the public emergency scan view, the patient dashboard, and the
  hospital terminal.
- **Supabase** — Postgres, Auth (JWT), Realtime, and Row Level Security.
  RLS enforces the proposal's two-tier access model directly at the database
  layer rather than in application code.
- **Tailwind CSS v4** for styling.

## Two-tier access model

| Tier | Who | How |
|---|---|---|
| 1 — Emergency crash data | Anyone with the QR token, no login | `get_emergency_snapshot(token)` — a `SECURITY DEFINER` Postgres function that returns only blood group, allergies, chronic conditions, and ICE contacts, and writes an audit log row on every call. There is no RLS grant that exposes this data directly; the function is the only door. |
| 2 — Full clinical ledger | Authenticated clinicians | Row Level Security on `clinical_records` checks `profiles.role in ('clinician', 'admin')`. |

The QR code printed on a card / shown in the app encodes only a random
`qr_token` (see `passports.qr_token` in the schema) — never medical data
itself, per the "zero-data ephemeral pointer" architecture in the proposal.

## Project layout

```
src/
  app/
    page.tsx                 landing page
    login/, signup/           auth forms (Server Actions)
    dashboard/                patient: manage passport, allergies, ICE contacts
    terminal/                 hospital: Tier 2 lookup + allergy contraindication check
    emergency/[token]/        public Tier 1 scan view (no auth)
  lib/
    actions/                  Server Actions (auth.ts, passport.ts)
    supabase/                 client.ts (browser), server.ts (RSC/actions),
                               middleware.ts (session refresh + route guard),
                               types.ts (hand-written DB types)
  middleware.ts                wires supabase/middleware.ts into Next.js
supabase/
  migrations/0001_init.sql     full schema, RLS policies, RPC functions
  config.toml                  local Supabase CLI config
```

## Setup

1. Install dependencies: `npm install`
2. Create a Supabase project (or run `supabase start` locally with the
   [Supabase CLI](https://supabase.com/docs/guides/cli)).
3. Apply the schema: `supabase db push` (or paste
   `supabase/migrations/0001_init.sql` into the SQL editor).
4. Copy `.env.local.example` to `.env.local` and fill in your project's URL
   and anon key.
5. `npm run dev` and open http://localhost:3000.

Regenerate typed DB bindings once a project is linked (replaces the
hand-written `src/lib/supabase/types.ts`):

```bash
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

## Known gaps (MVP scaffold, not yet built)

- Signup lets anyone self-select the `clinician` role for demo purposes —
  production needs admin-gated clinician provisioning.
- QR scanning on the terminal is a paste/type field, not a camera scanner.
- Pharmacy telemetry (Module 4) has schema (`pharmacies`,
  `medication_holds`) but no UI yet.
- PWA manifest references `/icon-192.png` and `/icon-512.png`, which don't
  exist yet — add real app icons before shipping installability.
- No automated tests yet.
