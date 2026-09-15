# VitalTag

**Dynamic Emergency Medical Passport & Clinical Triage Infrastructure**

VitalTag is a dynamic emergency medical identity system designed to conquer the critical **'Golden Hour'** in acute healthcare delivery. It provides first responders with 2-second access to verified crash data (blood group, severe allergies, chronic conditions, emergency ICE contacts) without requiring a login or exposing personal health identifiers (PHI) on the physical card/QR code. Authenticated clinicians gain access to the full Tier 2 clinical ledger and contraindication cross-check engine.

Full proposal spec: `VitalTag_Executive_Proposal_HatchPoint.docx`.

---

## 🛠️ Stack

* **Framework**: Next.js 16.3.5 (App Router, TypeScript)
* **Database & Auth**: Supabase (PostgreSQL, Supabase Auth with `@supabase/ssr`, RLS policies, Realtime, PL/pgSQL RPCs)
* **Styling & Design System**: Tailwind CSS v4 (`globals.css`) + self-hosted variable *Fraunces* display font
* **Icons & QR**: `lucide-react`, `qrcode.react`, native `BarcodeDetector` API

---

## 🔐 Access Model

| Access Tier | Target User | Authentication | Accessible Data |
|---|---|---|---|
| **Tier 1 — Crash Data** | EMTs, First Responders, Public | **Zero Login** (Scanned QR pointer token) | `get_emergency_snapshot()` RPC: Blood group, severe allergies, chronic alerts, priority ICE contacts with 1-click calling. Logged in `access_audit_log`. |
| **Tier 2 — Full Ledger** | Hospital Clinicians & Admins | **Authenticated** (Role-Based RLS) | `clinical_records` table: Doctor notes, active prescriptions, complete diagnosis history, national health ID, and allergy contraindication cross-check. |

---

## 🚀 Quick Demo Accounts

The database includes pre-seeded demo accounts for instant workflow evaluation (accessible directly via 1-click buttons on `/login`):

| Role | Email | Password | Details & Pre-loaded Data |
|---|---|---|---|
| 🩺 **Clinician Demo** | `clinician@vitaltag.demo` | `Password123!` | Role: `clinician` (Dr. Sarah Jenkins). Access to Tier 2 hospital terminal, full ledger editing, and contraindication engine. |
| 👤 **Patient Demo** | `patient@vitaltag.demo` | `Password123!` | Role: `patient` (John Doe). Pre-loaded Blood Group `O+`, severe Penicillin allergy, Asthma, Diabetes, ICE contacts, and fixed QR Token: `11111111-1111-1111-1111-111111111111`. |

---

## ⚡ Quick Start

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

## ✅ Feature Implementation Status

- [x] **Zero-Data QR ephemerality**: Physical cards contain only a random 128-bit UUID pointer token.
- [x] **Tier 1 Emergency Crash Interface**: Public `/emergency/[token]` route with 1-click ICE dialing.
- [x] **Tier 2 Hospital Triage Terminal**: `/terminal` route with full clinical record writing (doctor notes, prescriptions, diagnosis history).
- [x] **Multi-Format Triage Search**: Terminal search accepts QR tokens, 128-bit UUIDs, National Health IDs (e.g., `NHID-99482-GH`), or Patient Names (`John Doe`).
- [x] **Browser Camera QR Code Scanner**: Native `BarcodeDetector` integration in `QrScanner.tsx` for scanning cards directly.
- [x] **Algorithmic Contraindication Cross-Check**: `check_allergy_contraindication` RPC flags drug-allergy conflicts in real-time.
- [x] **Session & Role-Aware Navigation**: Header updates dynamically with role badges (`Clinician` / `Patient`) and shortcuts.
- [x] **Hydration-Safe QR Component**: Solved SSR vs Client URL hydration mismatch in `PassportQr.tsx`.
- [ ] **Module 4 Pharmacy Network & Medication Holds**: Schema ready (`pharmacies`, `medication_holds`); UI reservation flow pending.
- [ ] **Patient Access Audit History UI**: Backend audit table (`access_audit_log`) active; patient dashboard UI history log pending.

---

## 📝 Conventions & Rules

- **Server Actions**: All mutations use Server Actions (`lib/actions/`), never API routes.
- **Error Redirects**: Failures redirect to `?error=` query parameters to ensure visible UI feedback instead of silent form crashes.
- **RLS Safety**: Never subquery `profiles` within its own policy — always use `SECURITY DEFINER` functions like `is_clinician()` to avoid Postgres recursion error `42P17`.
- **Migrations**: New database changes must be added as sequential migration files (`supabase/migrations/`).
