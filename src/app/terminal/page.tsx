import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function TerminalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; med?: string }>;
}) {
  const { token, med } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware redirects unauthenticated users

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "clinician" && profile.role !== "admin")) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-xl font-semibold">401 — Restricted terminal</p>
        <p className="text-sm text-foreground/60">
          This route requires an authenticated clinician credential. Your
          account role is &quot;{profile?.role ?? "unknown"}&quot;.
        </p>
      </main>
    );
  }

  let passport: { id: string; blood_group: string; national_health_id: string | null } | null =
    null;
  let allergies: { substance: string; severity: string; reaction_notes: string | null }[] = [];
  let conditions: { condition_name: string; notes: string | null }[] = [];
  let contacts: { name: string; relationship: string; phone: string }[] = [];
  let clinicalRecord: {
    diagnosis_history: unknown;
    prescriptions: unknown;
    doctor_notes: string | null;
  } | null = null;
  let contraindications: { substance: string; severity: string }[] = [];

  if (token) {
    const { data: p } = await supabase
      .from("passports")
      .select("id, blood_group, national_health_id")
      .eq("qr_token", token)
      .maybeSingle();
    passport = p;

    if (passport) {
      const [{ data: a }, { data: c }, { data: ic }, { data: cr }] =
        await Promise.all([
          supabase.from("allergies").select("*").eq("passport_id", passport.id),
          supabase
            .from("chronic_conditions")
            .select("*")
            .eq("passport_id", passport.id),
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
        const { data: flagged } = await supabase.rpc(
          "check_allergy_contraindication",
          { p_passport_id: passport.id, p_medication: med },
        );
        contraindications = flagged ?? [];
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hospital terminal</h1>
          <p className="text-sm text-foreground/60">
            Signed in as {profile.full_name} ({profile.role})
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm underline underline-offset-4">
            Log out
          </button>
        </form>
      </div>

      <form className="flex gap-2" action="/terminal">
        <input
          name="token"
          defaultValue={token}
          placeholder="Scan or paste QR token"
          required
          className="flex-1 rounded-md border border-foreground/20 px-3 py-2 font-mono text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          Look up
        </button>
      </form>

      {token && !passport && (
        <p className="text-sm text-foreground/60">
          No passport found for that token.
        </p>
      )}

      {passport && (
        <div className="space-y-6">
          <section className="rounded-lg border border-foreground/15 p-5">
            <p className="text-sm text-foreground/60">Blood group</p>
            <p className="text-3xl font-bold">{passport.blood_group}</p>
            {passport.national_health_id && (
              <p className="mt-2 text-sm text-foreground/60">
                National health ID: {passport.national_health_id}
              </p>
            )}
          </section>

          <section className="rounded-lg border border-foreground/15 p-5">
            <p className="mb-2 text-sm font-semibold">
              Allergy contraindication check
            </p>
            <form className="flex gap-2" action="/terminal">
              <input type="hidden" name="token" value={token} />
              <input
                name="med"
                defaultValue={med}
                placeholder="Medication to check (e.g. Amoxicillin)"
                className="flex-1 rounded-md border border-foreground/20 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
              >
                Check
              </button>
            </form>
            {med && (
              <p
                className={`mt-3 text-sm font-semibold ${
                  contraindications.length
                    ? "text-emergency-accent"
                    : "text-green-600"
                }`}
              >
                {contraindications.length
                  ? `⚠ Conflict: patient has a recorded ${contraindications[0].severity} allergy to ${contraindications[0].substance}.`
                  : `No recorded allergy conflicts with "${med}".`}
              </p>
            )}
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold">Allergies</p>
              <ul className="space-y-1 text-sm">
                {allergies.map((a, i) => (
                  <li key={i}>
                    {a.substance} ({a.severity})
                  </li>
                ))}
                {!allergies.length && (
                  <li className="text-foreground/50">None recorded.</li>
                )}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Chronic conditions</p>
              <ul className="space-y-1 text-sm">
                {conditions.map((c, i) => (
                  <li key={i}>{c.condition_name}</li>
                ))}
                {!conditions.length && (
                  <li className="text-foreground/50">None recorded.</li>
                )}
              </ul>
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-semibold">Emergency contacts</p>
            <ul className="space-y-1 text-sm">
              {contacts.map((c, i) => (
                <li key={i}>
                  {c.name} ({c.relationship}) — {c.phone}
                </li>
              ))}
              {!contacts.length && (
                <li className="text-foreground/50">None recorded.</li>
              )}
            </ul>
          </section>

          <section className="rounded-lg border border-foreground/15 p-5">
            <p className="mb-2 text-sm font-semibold">
              Full clinical ledger (Tier 2)
            </p>
            {clinicalRecord ? (
              <div className="space-y-2 text-sm text-foreground/70">
                {clinicalRecord.doctor_notes && (
                  <p>{clinicalRecord.doctor_notes}</p>
                )}
                <pre className="overflow-x-auto rounded-md bg-foreground/5 p-3 text-xs">
                  {JSON.stringify(
                    {
                      diagnosis_history: clinicalRecord.diagnosis_history,
                      prescriptions: clinicalRecord.prescriptions,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-foreground/50">
                No clinical record on file yet.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
