import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { saveClinicalRecord } from "@/lib/actions/clinical";
import { QrScanner } from "@/components/QrScanner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ShieldAlert,
  Search,
  Activity,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

export default async function TerminalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; med?: string; error?: string; saved?: string }>;
}) {
  const { token, med, error, saved } = await searchParams;
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

  if (!profile || (profile.role !== "clinician" && profile.role !== "admin")) {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <div className="rounded-full bg-emergency-warn-bg p-4 text-emergency-accent">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h1 className="font-display text-3xl font-semibold">401 — Restricted Terminal</h1>
          <p className="max-w-md text-sm leading-relaxed text-brand/70">
            This terminal requires an authenticated clinician or admin account credential.
            Your current account role is &quot;{profile?.role ?? "unknown"}&quot;.
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  let passport: { id: string; blood_group: string; national_health_id: string | null } | null = null;
  let allergies: { substance: string; severity: string; reaction_notes: string | null }[] = [];
  let conditions: { condition_name: string; notes: string | null }[] = [];
  let contacts: { name: string; relationship: string; phone: string }[] = [];
  let clinicalRecord: {
    diagnosis_history: unknown;
    prescriptions: unknown;
    doctor_notes: string | null;
  } | null = null;
  let contraindications: { substance: string; severity: string; reaction_notes: string | null }[] = [];

  if (token) {
    const { data: p } = await supabase
      .from("passports")
      .select("id, blood_group, national_health_id")
      .eq("qr_token", token)
      .maybeSingle();
    passport = p;

    if (passport) {
      const [{ data: a }, { data: c }, { data: ic }, { data: cr }] = await Promise.all([
        supabase.from("allergies").select("*").eq("passport_id", passport.id),
        supabase.from("chronic_conditions").select("*").eq("passport_id", passport.id),
        supabase.from("ice_contacts").select("*").eq("passport_id", passport.id),
        supabase
          .from("clinical_records")
          .select("*")
          .eq("passport_id", passport.id)
          .maybeSingle(),
      ]);
      allergies = a ?? [];
      conditions = c ?? [];
      contacts = ic ?? [];
      clinicalRecord = cr;

      if (med) {
        const { data: flagged } = await supabase.rpc("check_allergy_contraindication", {
          p_passport_id: passport.id,
          p_medication: med,
        });
        contraindications = flagged ?? [];
      }
    }
  }

  const existingDiagnoses = Array.isArray(clinicalRecord?.diagnosis_history)
    ? (clinicalRecord.diagnosis_history as string[]).join(", ")
    : "";
  const existingPrescriptions = Array.isArray(clinicalRecord?.prescriptions)
    ? (clinicalRecord.prescriptions as string[]).join(", ")
    : "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-6 py-12">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-brand/15 bg-background-elevated p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand/10 p-3 text-brand">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Hospital Terminal</h1>
              <p className="flex items-center gap-2 text-xs text-brand/70">
                <UserCheck className="h-3.5 w-3.5 text-brand" /> Verified Clinician:{" "}
                <span className="font-semibold">{profile.full_name}</span> ({profile.role})
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-brand/20 px-4 py-2 text-xs font-semibold text-brand transition hover:bg-brand/10"
            >
              Log out
            </button>
          </form>
        </div>

        {/* Notifications */}
        {error && (
          <div className="rounded-2xl bg-emergency-warn-bg p-4 text-sm text-emergency-fg flex items-center gap-2 border border-emergency-accent/30">
            <AlertTriangle className="h-4 w-4 shrink-0 text-emergency-accent" />
            <span>{error}</span>
          </div>
        )}
        {saved && (
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-800 flex items-center gap-2 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Clinical record saved successfully.</span>
          </div>
        )}

        {/* Lookup Bar & Scanner */}
        <section className="rounded-3xl border border-brand/15 bg-cream p-6 shadow-sm space-y-4">
          <label htmlFor="qr-search-input" className="text-sm font-semibold tracking-wide uppercase text-brand/70 block">
            Passport Lookup
          </label>
          <div className="flex flex-wrap gap-3">
            <form action="/terminal" className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand/40" />
                <input
                  id="qr-search-input"
                  name="token"
                  defaultValue={token}
                  placeholder="Scan QR or paste 128-bit pointer token UUID..."
                  required
                  className="w-full rounded-2xl border border-brand/20 bg-background-elevated pl-10 pr-4 py-2.5 font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-brand px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
              >
                Look up
              </button>
            </form>
            <QrScanner
              onScan={(scannedToken) => {
                window.location.href = `/terminal?token=${encodeURIComponent(scannedToken)}`;
              }}
            />
          </div>
        </section>

        {token && !passport && (
          <div className="rounded-3xl border border-brand/15 bg-background-elevated p-8 text-center">
            <p className="text-base font-semibold">No passport found for token</p>
            <p className="mt-1 text-xs text-brand/60 font-mono">{token}</p>
          </div>
        )}

        {passport && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Overview stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <section className="rounded-3xl border border-brand/15 bg-cream p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand/60">
                  Blood Group
                </p>
                <p className="mt-2 font-display text-4xl font-bold text-brand">
                  {passport.blood_group}
                </p>
              </section>

              <section className="rounded-3xl border border-brand/15 bg-cream p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand/60">
                  National Health ID
                </p>
                <p className="mt-2 text-xl font-bold font-mono text-brand">
                  {passport.national_health_id ?? "Not linked"}
                </p>
              </section>

              <section className="rounded-3xl border border-brand/15 bg-cream p-6 sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand/60">
                  Allergies On File
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-brand">
                  {allergies.length} recorded
                </p>
              </section>
            </div>

            {/* Contraindication Engine */}
            <section className="rounded-3xl border border-brand/15 bg-background-elevated p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand" />
                <h3 className="font-display text-xl font-semibold">
                  Medication Contraindication Cross-Check
                </h3>
              </div>
              <form action="/terminal" className="flex gap-2">
                <input type="hidden" name="token" value={token} />
                <input
                  name="med"
                  defaultValue={med}
                  placeholder="Enter medication name (e.g. Penicillin, Amoxicillin, Aspirin)..."
                  className="flex-1 rounded-xl border border-brand/20 px-4 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
                >
                  Check Conflict
                </button>
              </form>

              {med && (
                <div
                  className={`rounded-2xl p-4 text-sm font-semibold border ${
                    contraindications.length
                      ? "bg-emergency-warn-bg text-emergency-fg border-emergency-accent/40"
                      : "bg-emerald-500/10 text-emerald-800 border-emerald-500/30"
                  }`}
                >
                  {contraindications.length ? (
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-emergency-accent uppercase tracking-wide">
                        <AlertTriangle className="h-4 w-4" /> ⚠ CONTRAINDICATION CONFLICT DETECTED
                      </p>
                      {contraindications.map((c, i) => (
                        <p key={i} className="text-xs font-normal">
                          Patient has a recorded <strong className="uppercase">{c.severity}</strong> allergy to{" "}
                          <strong>{c.substance}</strong>. {c.reaction_notes}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      No recorded allergy conflicts found for medication &quot;{med}&quot;.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Field Data Summaries */}
            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-3xl border border-brand/15 bg-cream p-6 space-y-3">
                <h3 className="font-display text-lg font-semibold">Recorded Allergies</h3>
                <ul className="space-y-2">
                  {allergies.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-brand/10 bg-background-elevated px-4 py-2.5 text-sm"
                    >
                      <span className="font-medium">{a.substance}</span>
                      <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold uppercase text-brand">
                        {a.severity}
                      </span>
                    </li>
                  ))}
                  {!allergies.length && (
                    <p className="text-xs text-brand/50">No allergies recorded.</p>
                  )}
                </ul>
              </section>

              <section className="rounded-3xl border border-brand/15 bg-cream p-6 space-y-3">
                <h3 className="font-display text-lg font-semibold">Chronic Conditions</h3>
                <ul className="space-y-2">
                  {conditions.map((c, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-brand/10 bg-background-elevated px-4 py-2.5 text-sm font-medium"
                    >
                      {c.condition_name}
                    </li>
                  ))}
                  {!conditions.length && (
                    <p className="text-xs text-brand/50">No chronic conditions recorded.</p>
                  )}
                </ul>
              </section>
            </div>

            {/* Emergency Contacts */}
            <section className="rounded-3xl border border-brand/15 bg-cream p-6 space-y-3">
              <h3 className="font-display text-lg font-semibold">Emergency Contacts</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {contacts.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-brand/10 bg-background-elevated p-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-brand/60">{c.relationship}</p>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="font-mono text-xs font-semibold text-brand underline"
                    >
                      {c.phone}
                    </a>
                  </li>
                ))}
                {!contacts.length && (
                  <p className="text-xs text-brand/50 sm:col-span-2">No contacts recorded.</p>
                )}
              </ul>
            </section>

            {/* Tier 2 Clinical Ledger & Write Form */}
            <section className="rounded-3xl border border-brand/20 bg-brand p-8 text-cream space-y-6 shadow-md">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-cream/90" />
                <div>
                  <h3 className="font-display text-2xl font-semibold">
                    Full Clinical Ledger (Tier 2)
                  </h3>
                  <p className="text-xs text-cream/70">
                    Restricted Hospital Record — Only visible to authenticated clinicians
                  </p>
                </div>
              </div>

              <form action={saveClinicalRecord} className="space-y-5">
                <input type="hidden" name="passport_id" value={passport.id} />
                <input type="hidden" name="qr_token" value={token} />

                <div className="space-y-1.5">
                  <label htmlFor="doctor_notes" className="text-xs font-semibold uppercase tracking-wider text-cream/80">
                    Doctor Notes & Clinical Summary
                  </label>
                  <textarea
                    id="doctor_notes"
                    name="doctor_notes"
                    rows={4}
                    defaultValue={clinicalRecord?.doctor_notes ?? ""}
                    placeholder="Enter clinical observations, emergency treatment notes, or medical history summary..."
                    className="w-full rounded-2xl border border-cream/20 bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-cream focus:ring-1 focus:ring-cream"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="diagnosis_history" className="text-xs font-semibold uppercase tracking-wider text-cream/80">
                      Diagnosis History (comma-separated)
                    </label>
                    <input
                      id="diagnosis_history"
                      name="diagnosis_history"
                      defaultValue={existingDiagnoses}
                      placeholder="e.g. Type 1 Diabetes, Hypertension, Asthma"
                      className="w-full rounded-2xl border border-cream/20 bg-cream/10 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-cream"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="prescriptions" className="text-xs font-semibold uppercase tracking-wider text-cream/80">
                      Active Prescriptions (comma-separated)
                    </label>
                    <input
                      id="prescriptions"
                      name="prescriptions"
                      defaultValue={existingPrescriptions}
                      placeholder="e.g. Insulin 10IU, Albuterol Inhaler"
                      className="w-full rounded-2xl border border-cream/20 bg-cream/10 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-cream"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-cream px-8 py-3 font-semibold text-brand transition hover:bg-cream/90"
                >
                  Save Clinical Record
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
