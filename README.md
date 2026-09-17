# VitalTag

**Dynamic Emergency Medical Passport & Clinical Triage Infrastructure**

VitalTag is a dynamic emergency medical identity system designed to conquer the critical **'Golden Hour'** in acute healthcare delivery. It provides first responders with 2-second access to verified crash data (blood group, severe allergies, chronic conditions, emergency ICE contacts) without requiring a login or exposing personal health identifiers (PHI) on the physical card/QR code. Authenticated clinicians gain access to the full Tier 2 clinical ledger and contraindication cross-check engine. Administrators manage role-based access control (RBAC), partner pharmacy networks, and system audit feeds.

Full proposal spec: `VitalTag_Executive_Proposal_HatchPoint.docx`.

---

## Stack

* **Framework**: Next.js 16.3.5 (App Router, TypeScript)
* **Database & Auth**: Supabase (PostgreSQL, Supabase Auth with `@supabase/ssr`, RLS policies, Realtime, PL/pgSQL RPCs)
* **Styling & Design System**: Tailwind CSS v4 (`globals.css`) + self-hosted variable *Fraunces* display font
* **Icons & QR**: `lucide-react`, `qrcode.react`, native `BarcodeDetector` API

---

## Access Model

| Access Tier | Target User | Authentication | Accessible Data & Capabilities |
|---|---|---|---|
| **Tier 1 — Crash Data** | EMTs, First Responders, Public | **Zero Login** (Scanned QR pointer token) | `get_emergency_snapshot()` RPC: Blood group, severe allergies, chronic alerts, priority ICE contacts with 1-click calling. Logged in `access_audit_log`. |
| **Tier 2 — Full Ledger** | Hospital Clinicians | **Authenticated** (Role-Based RLS) | `clinical_records` table: Doctor notes, active prescriptions, complete diagnosis history, national health ID, contraindication cross-check, and 60-min pharmacy medication holds. |
| **Admin Control Portal** | System Administrators | **Authenticated** (`admin` Role RLS) | `profiles`, `pharmacies`, `access_audit_log` tables: Clinician account verification, user role assignment (Patient ↔ Clinician ↔ Admin), partner pharmacy onboarding, system metrics, and global access audit feed. |

---

## Quick Demo Accounts

The database includes pre-seeded demo accounts for instant workflow evaluation (Password for all: `Password123!`):

| Role | Email | Password | Details & Pre-loaded Data |
|---|---|---|---|
| **Admin Demo** | `admin@vitaltag.demo` | `Password123!` | Role: `admin` (System Administrator). Full access to `/admin` control portal, RBAC user role table, partner dispensary onboarding, and global security audit feed. |
| **Clinician Demo** | `clinician@vitaltag.demo` | `Password123!` | Role: `clinician` (Dr. Sarah Jenkins). Access to `/terminal` hospital triage, full clinical ledger editing, and contraindication engine. |
| **Patient Demo** | `patient@vitaltag.demo` | `Password123!` | Role: `patient` (John Doe). Pre-loaded Blood Group `O+`, severe Penicillin allergy, Asthma, Diabetes, ICE contacts, 60-min pharmacy hold telemetry, zero-PHI printable card, and fixed QR Token: `11111111-1111-1111-1111-111111111111`. |

---

## Quick Start

1. **Environment Configuration**:
   Copy `.env.local.example` to `.env.local` and configure your Supabase URL & Anon Key:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build & Verify Production Bundle**:
   ```bash
   npm run build
   ```

---

## Feature Implementation Status

- [x] **Zero-Data QR Ephemerality**: Physical cards contain strictly zero PHI — only cardholder full name and a random 128-bit UUID pointer token.
- [x] **Zero-PHI Printable Wallet Cards**: Self-service printable card component (`WalletCardPrint.tsx`) accessible directly from Patient Dashboard (`/dashboard`).
- [x] **Tier 1 Emergency Crash Interface**: Public `/emergency/[token]` route with 1-click ICE dialing and zero-login first responder access.
- [x] **Tier 2 Hospital Triage Terminal**: `/terminal` route with full clinical record writing (doctor notes, prescriptions, diagnosis history).
- [x] **Multi-Format Triage Search**: Terminal search accepts QR tokens, 128-bit UUIDs, National Health IDs (e.g., `NHID-99482-GH`), or Patient Names (`John Doe`).
- [x] **Browser Camera QR Code Scanner**: Native `BarcodeDetector` API integration in `QrScanner.tsx` for scanning cards directly with device cameras.
- [x] **Algorithmic Contraindication Cross-Check**: `check_allergy_contraindication` RPC flags drug-allergy conflicts in real-time before prescribing.
- [x] **Module 4 Pharmacy Network & Post-Triage Medication Holds**: 60-minute prescription hold reservation UI (`PharmacyHolds.tsx`) with real-time countdown telemetry.
- [x] **Admin Control Portal**: Restricted `/admin` route for system metrics, clinician verification, user RBAC role management, and partner dispensary onboarding.
- [x] **Self-Service Admin Role Elevation**: Built-in `claimAdminRole` action and elevation button on `/admin` for rapid setup and testing.
- [x] **Patient & Global Access Audit History UI**: Real-time `access_audit_log` security feed on `/dashboard` (patient view) and `/admin` (global system audit feed).
- [x] **Show / Hide Password Toggle**: Integrated reusable `PasswordInput` toggle component across `/login` and `/signup`.
- [x] **Admin Signup Restriction**: Administrator option removed from public `/signup` page (admin creation managed strictly via codebase/SQL scripts & RBAC portal).
- [x] **Session & Role-Aware Navigation**: Header updates dynamically with role badges (`Admin`, `Clinician`, `Patient`) and shortcuts.
- [x] **Hydration-Safe QR Component**: Solved SSR vs Client URL hydration mismatch in `PassportQr.tsx`.

---

## Conventions & Rules

- **Server Actions**: All mutations use Server Actions (`lib/actions/`), never API routes.
- **Error Redirects**: Failures redirect to `?error=` query parameters to ensure visible UI feedback instead of silent form crashes.
- **RLS Safety**: Never subquery `profiles` within its own policy — always use `SECURITY DEFINER` functions like `is_clinician()` to avoid Postgres recursion error `42P17`.

---

## License

This project is licensed under the MIT License - see the [LICENSE](file:///home/mykecodes/Desktop/vitaltag/LICENSE) file for details.
