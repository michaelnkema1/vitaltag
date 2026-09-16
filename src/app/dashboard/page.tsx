import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import {
  createPassport,
  addAllergy,
  addChronicCondition,
  addIceContact,
} from "@/lib/actions/passport";
import { PassportQr } from "@/components/PassportQr";
import { PharmacyHolds } from "@/components/PharmacyHolds";
import { WalletCardPrint } from "@/components/WalletCardPrint";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import Link from "next/link";
import {
  AlertTriangle,
  Plus,
  LogOut,
  ShieldCheck,
  PhoneCall,
  Activity,
  Stethoscope,
  FileText,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Store,
} from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; hold_success?: string; hold_cancelled?: string }>;
}) {
  const { error: actionError, hold_success, hold_cancelled } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // Middleware redirects unauthenticated users

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isClinician = profile?.role === "clinician" || profile?.role === "admin";

  const { data: passport, error: passportError } = await supabase
    .from("passports")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (passportError) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-16">
          <h1 className="font-display text-2xl font-bold">Couldn&apos;t load passport</h1>
          <p className="rounded-2xl bg-emergency-warn-bg px-4 py-3 text-sm text-emergency-fg border border-emergency-accent/30">
            {passportError.message}
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Fetch clinical records if passport exists and clinician is logged in
  let clinicalRecord: {
    diagnosis_history: unknown;
    prescriptions: unknown;
    doctor_notes: string | null;
  } | null = null;

  if (passport && isClinician) {
    const { data: cr } = await supabase
      .from("clinical_records")
      .select("*")
      .eq("passport_id", passport.id)
      .maybeSingle();
    clinicalRecord = cr;
  }

  if (!passport) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
          <div className="rounded-3xl border border-brand/15 bg-background-elevated p-8 shadow-[0_24px_50px_-28px_rgb(var(--shadow-color)/0.4)] space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] uppercase text-brand/60">
                Emergency Passport
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold">
                {isClinician ? "Create Patient Passport" : "Set up your VitalTag"}
              </h1>
            </div>
            <p className="text-sm leading-relaxed text-brand/70">
              This creates the emergency crash-data record and issues a unique 128-bit QR pointer token.
            </p>

            {actionError && (
              <p className="rounded-2xl bg-emergency-warn-bg px-4 py-2.5 text-sm text-emergency-fg">
                {actionError}
              </p>
            )}

            <form action={createPassport} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="blood_group" className="text-sm font-medium">
                  Select Blood Group
                </label>
                <select
                  id="blood_group"
                  name="blood_group"
                  required
                  className="w-full rounded-xl border border-brand/20 px-4 py-3 text-sm bg-background-elevated"
                >
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "unknown"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-brand py-3.5 font-semibold text-cream transition hover:bg-brand-dark"
              >
                Create Passport
              </button>
            </form>

            {isClinician && (
              <div className="border-t border-brand/15 pt-4">
                <Link
                  href="/terminal"
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-brand/20 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/10"
                >
                  <Stethoscope className="h-4 w-4" /> Go to Hospital Terminal
                </Link>
              </div>
            )}
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Parallel data fetching for passport sub-entities, pharmacies, holds, and audit logs
  const [
    { data: allergies },
    { data: conditions },
    { data: contacts },
    { data: pharmacies },
    { data: holds },
    { data: auditLogs },
  ] = await Promise.all([
    supabase.from("allergies").select("*").eq("passport_id", passport.id).order("created_at"),
    supabase.from("chronic_conditions").select("*").eq("passport_id", passport.id).order("created_at"),
    supabase.from("ice_contacts").select("*").eq("passport_id", passport.id).order("priority"),
    supabase.from("pharmacies").select("*").order("name"),
    supabase
      .from("medication_holds")
      .select("*, pharmacies(name, address, phone)")
      .eq("passport_id", passport.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("access_audit_log")
      .select("*")
      .eq("passport_id", passport.id)
      .order("accessed_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-6 py-12">
        {/* Banners */}
        {actionError && (
          <div className="rounded-2xl bg-emergency-warn-bg p-4 text-sm text-emergency-fg flex items-center gap-2 border border-emergency-accent/30">
            <AlertTriangle className="h-4 w-4 shrink-0 text-emergency-accent" />
            <span>{actionError}</span>
          </div>
        )}
        {hold_success && (
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-800 flex items-center gap-2 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>60-Minute Post-Triage Prescription Hold reserved successfully!</span>
          </div>
        )}
        {hold_cancelled && (
          <div className="rounded-2xl bg-foreground/5 p-4 text-sm text-foreground/70 flex items-center gap-2 border border-foreground/15">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground/60" />
            <span>Prescription hold cancelled.</span>
          </div>
        )}

        {/* Dashboard Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand/15 pb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold">VitalTag Passport</h1>
            <p className="text-xs text-brand/70 mt-1 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Logged in as:{" "}
              <span className="font-semibold">{profile?.full_name ?? user.email}</span> (
              <span className="uppercase">{profile?.role ?? "patient"}</span>)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <WalletCardPrint
              qrToken={passport.qr_token}
              fullName={profile?.full_name ?? "Patient"}
            />

            {isClinician && (
              <Link
                href={`/terminal?token=${encodeURIComponent(passport.qr_token)}`}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-cream transition hover:bg-brand-dark"
              >
                <Stethoscope className="h-4 w-4" /> Hospital Terminal <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-brand/20 px-4 py-2 text-xs font-semibold text-brand transition hover:bg-brand/10"
              >
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            </form>
          </div>
        </div>

        {/* Clinician Tier 2 Action Banner */}
        {isClinician && (
          <section className="rounded-3xl border border-brand/20 bg-brand p-6 text-cream flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cream/10 p-3 text-cream">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cream/70">
                  Clinician Privileges Active
                </p>
                <h3 className="font-display text-xl font-semibold">
                  Full Clinical Access Unlocked
                </h3>
                <p className="text-xs text-cream/80">
                  You are viewing patient information with Tier 2 authorization.
                </p>
              </div>
            </div>
            <Link
              href={`/terminal?token=${encodeURIComponent(passport.qr_token)}`}
              className="rounded-full bg-cream px-5 py-2.5 text-xs font-semibold text-brand transition hover:bg-cream/90 inline-flex items-center gap-1.5"
            >
              Open in Hospital Terminal <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        )}

        {/* QR Card & Crash Overview */}
        <section className="grid gap-8 rounded-3xl border border-brand/15 bg-cream p-8 shadow-sm md:grid-cols-[auto_1fr] items-center">
          <div className="flex flex-col items-center">
            <PassportQr token={passport.qr_token} />
            <p className="mt-3 font-mono text-[0.65rem] text-brand/50">
              Token: {passport.qr_token.slice(0, 8)}...
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand/60">
                Blood Group
              </p>
              <p className="font-display text-5xl font-bold text-brand">{passport.blood_group}</p>
            </div>
            <div className="rounded-2xl bg-background-elevated/80 p-4 text-xs text-brand/75 leading-relaxed border border-brand/10 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-brand shrink-0 mt-0.5" />
              <div>
                <strong>Zero-PHI Card Security:</strong> Anyone scanning this code sees only Tier 1 emergency crash data (blood group, severe allergies, chronic alerts, and ICE contacts). Full hospital ledgers remain locked behind verified clinician login.
              </div>
            </div>
            <div className="pt-2">
              <WalletCardPrint
                qrToken={passport.qr_token}
                fullName={profile?.full_name ?? "Patient"}
              />
            </div>
          </div>
        </section>

        {/* Tier 2 Clinical Ledger Summary (Visible to Clinicians) */}
        {isClinician && clinicalRecord && (
          <section className="rounded-3xl border border-brand/15 bg-background-elevated p-8 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" />
              <h2 className="font-display text-xl font-semibold">Tier 2 Clinical Ledger Details</h2>
            </div>
            {clinicalRecord.doctor_notes && (
              <div className="rounded-2xl bg-cream p-4 text-sm text-brand/80 border border-brand/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand/60 mb-1">
                  Doctor Notes
                </p>
                <p>{clinicalRecord.doctor_notes}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl bg-cream p-4 border border-brand/10 space-y-1">
                <p className="font-semibold uppercase text-brand/60">Diagnoses</p>
                <p className="font-medium text-brand">
                  {Array.isArray(clinicalRecord.diagnosis_history)
                    ? (clinicalRecord.diagnosis_history as string[]).join(", ")
                    : "None recorded"}
                </p>
              </div>
              <div className="rounded-2xl bg-cream p-4 border border-brand/10 space-y-1">
                <p className="font-semibold uppercase text-brand/60">Prescriptions</p>
                <p className="font-medium text-brand">
                  {Array.isArray(clinicalRecord.prescriptions)
                    ? (clinicalRecord.prescriptions as string[]).join(", ")
                    : "None recorded"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Module 4: Pharmacy Telemetry & Medication Holds */}
        <section className="rounded-3xl border border-brand/15 bg-cream p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-brand" />
            <h2 className="font-display text-xl font-semibold">
              Pharmacy Telemetry & Prescription Holds
            </h2>
          </div>
          <PharmacyHolds
            passportId={passport.id}
            pharmacies={pharmacies ?? []}
            holds={(holds as unknown as Parameters<typeof PharmacyHolds>[0]["holds"]) ?? []}
            redirectUrl="/dashboard"
          />
        </section>

        {/* Allergies Section */}
        <section className="rounded-3xl border border-brand/15 bg-background-elevated p-8 space-y-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-brand" />
            <h2 className="font-display text-xl font-semibold">Allergies</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {allergies?.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-2xl border border-brand/15 bg-cream px-4 py-3 text-sm"
              >
                <span className="font-semibold">{a.substance}</span>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold uppercase text-brand">
                  {a.severity}
                </span>
              </li>
            ))}
            {!allergies?.length && (
              <p className="text-xs text-brand/50 sm:col-span-2">No allergies recorded on file.</p>
            )}
          </ul>
          <form action={addAllergy} className="flex flex-wrap gap-3 pt-2">
            <input type="hidden" name="passport_id" value={passport.id} />
            <input
              name="substance"
              placeholder="Substance (e.g. Penicillin, Peanuts)"
              required
              className="flex-1 rounded-xl border border-brand/20 px-4 py-2.5 text-sm"
            />
            <select
              name="severity"
              defaultValue="severe"
              className="rounded-xl border border-brand/20 px-4 py-2.5 text-sm"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" /> Add Allergy
            </button>
          </form>
        </section>

        {/* Chronic Conditions Section */}
        <section className="rounded-3xl border border-brand/15 bg-background-elevated p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand" />
            <h2 className="font-display text-xl font-semibold">Chronic Conditions</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {conditions?.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-brand/15 bg-cream px-4 py-3 text-sm font-semibold"
              >
                {c.condition_name}
              </li>
            ))}
            {!conditions?.length && (
              <p className="text-xs text-brand/50 sm:col-span-2">No chronic conditions recorded.</p>
            )}
          </ul>
          <form action={addChronicCondition} className="flex flex-wrap gap-3 pt-2">
            <input type="hidden" name="passport_id" value={passport.id} />
            <input
              name="condition_name"
              placeholder="Condition (e.g. Asthma, Type 1 Diabetes)"
              required
              className="flex-1 rounded-xl border border-brand/20 px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" /> Add Condition
            </button>
          </form>
        </section>

        {/* ICE Contacts Section */}
        <section className="rounded-3xl border border-brand/15 bg-background-elevated p-8 space-y-6">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-brand" />
            <h2 className="font-display text-xl font-semibold">Emergency Contacts (ICE)</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {contacts?.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-2xl border border-brand/15 bg-cream p-4 text-sm"
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-brand/60">{c.relationship}</p>
                </div>
                <span className="font-mono text-xs font-semibold text-brand">{c.phone}</span>
              </li>
            ))}
            {!contacts?.length && (
              <p className="text-xs text-brand/50 sm:col-span-2">No emergency contacts recorded.</p>
            )}
          </ul>
          <form action={addIceContact} className="flex flex-wrap gap-3 pt-2">
            <input type="hidden" name="passport_id" value={passport.id} />
            <input
              name="name"
              placeholder="Contact Name"
              required
              className="flex-1 min-w-[140px] rounded-xl border border-brand/20 px-4 py-2.5 text-sm"
            />
            <input
              name="relationship"
              placeholder="Relationship (e.g. Spouse)"
              required
              className="w-36 rounded-xl border border-brand/20 px-4 py-2.5 text-sm"
            />
            <input
              name="phone"
              placeholder="Phone Number"
              required
              className="w-44 rounded-xl border border-brand/20 px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" /> Add Contact
            </button>
          </form>
        </section>

        {/* Access Audit History Section */}
        <section className="rounded-3xl border border-brand/15 bg-background-elevated p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand" />
            <div>
              <h2 className="font-display text-xl font-semibold">Access & Security Audit Logs</h2>
              <p className="text-xs text-brand/60">
                Real-time security history recorded whenever your emergency passport is scanned
              </p>
            </div>
          </div>

          <div className="divide-y divide-brand/10 overflow-hidden rounded-2xl border border-brand/15 bg-cream">
            {auditLogs?.map((log) => {
              const accessedAt = new Date(log.accessed_at);
              const meta = log.metadata as Record<string, unknown> | null;
              const viaText = typeof meta?.via === "string" ? meta.via : "QR Scan";

              return (
                <div key={log.id} className="flex items-center justify-between p-4 text-xs">
                  <div className="space-y-0.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 font-bold uppercase text-[0.6rem] ${
                        log.tier === 1
                          ? "bg-emergency-accent/20 text-emergency-accent"
                          : "bg-brand/10 text-brand"
                      }`}
                    >
                      Tier {log.tier} {log.tier === 1 ? "Emergency Scan" : "Hospital Ledger Scan"}
                    </span>
                    <p className="text-brand/80 font-medium">
                      Accessed via {viaText}
                    </p>
                  </div>
                  <span className="font-mono text-brand/60">
                    {accessedAt.toLocaleDateString()} {accessedAt.toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
            {!auditLogs?.length && (
              <div className="p-6 text-center text-xs text-brand/50">
                No passport scan logs recorded yet.
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
