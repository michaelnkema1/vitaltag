import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import {
  createPassport,
  addAllergy,
  addChronicCondition,
  addIceContact,
} from "@/lib/actions/passport";
import { PassportQr } from "@/components/PassportQr";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: actionError } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware already redirects unauthenticated users

  const { data: passport, error: passportError } = await supabase
    .from("passports")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Never treat a failed read as "no passport yet" -- that mismatch is
  // exactly what let a masked RLS error cause dozens of duplicate rows
  // to get created silently. Surface it instead.
  if (passportError) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-2xl font-bold">Couldn&apos;t load your passport</h1>
        <p className="rounded-md bg-emergency-warn-bg px-3 py-2 text-sm text-emergency-fg">
          {passportError.message}
        </p>
      </main>
    );
  }

  if (!passport) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
        <h1 className="text-2xl font-bold">Set up your VitalTag passport</h1>
        <p className="text-sm text-foreground/60">
          This creates your emergency crash-data record and issues a QR
          pointer token for your card.
        </p>
        {actionError && (
          <p className="rounded-md bg-emergency-warn-bg px-3 py-2 text-sm text-emergency-fg">
            {actionError}
          </p>
        )}
        <form action={createPassport} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="blood_group" className="text-sm font-medium">
              Blood group
            </label>
            <select
              id="blood_group"
              name="blood_group"
              required
              className="w-full rounded-md border border-foreground/20 px-3 py-2"
            >
              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "unknown"].map(
                (bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ),
              )}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-foreground py-2 font-semibold text-background"
          >
            Create passport
          </button>
        </form>
      </main>
    );
  }

  const [{ data: allergies }, { data: conditions }, { data: contacts }] =
    await Promise.all([
      supabase
        .from("allergies")
        .select("*")
        .eq("passport_id", passport.id)
        .order("created_at"),
      supabase
        .from("chronic_conditions")
        .select("*")
        .eq("passport_id", passport.id)
        .order("created_at"),
      supabase
        .from("ice_contacts")
        .select("*")
        .eq("passport_id", passport.id)
        .order("priority"),
    ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-6 py-12">
      {actionError && (
        <p className="rounded-md bg-emergency-warn-bg px-3 py-2 text-sm text-emergency-fg">
          {actionError}
        </p>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your VitalTag passport</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm underline underline-offset-4">
            Log out
          </button>
        </form>
      </div>

      <section className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <PassportQr token={passport.qr_token} />
        <div className="space-y-1">
          <p className="text-sm text-foreground/60">Blood group</p>
          <p className="text-3xl font-bold">{passport.blood_group}</p>
          <p className="mt-4 text-xs text-foreground/50">
            Anyone who scans this code sees only your Tier 1 crash data —
            blood group, severe allergies, chronic alerts, and ICE contacts.
            Your full clinical ledger stays behind clinician login.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Allergies</h2>
        <ul className="space-y-2">
          {allergies?.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-md border border-foreground/15 px-4 py-2"
            >
              <span>{a.substance}</span>
              <span className="text-xs uppercase text-foreground/50">
                {a.severity}
              </span>
            </li>
          ))}
          {!allergies?.length && (
            <p className="text-sm text-foreground/50">None recorded.</p>
          )}
        </ul>
        <form action={addAllergy} className="flex flex-wrap gap-2">
          <input type="hidden" name="passport_id" value={passport.id} />
          <input
            name="substance"
            placeholder="Substance (e.g. Penicillin)"
            required
            className="flex-1 rounded-md border border-foreground/20 px-3 py-2 text-sm"
          />
          <select
            name="severity"
            defaultValue="severe"
            className="rounded-md border border-foreground/20 px-3 py-2 text-sm"
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            Add
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Chronic conditions</h2>
        <ul className="space-y-2">
          {conditions?.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-foreground/15 px-4 py-2"
            >
              {c.condition_name}
            </li>
          ))}
          {!conditions?.length && (
            <p className="text-sm text-foreground/50">None recorded.</p>
          )}
        </ul>
        <form action={addChronicCondition} className="flex flex-wrap gap-2">
          <input type="hidden" name="passport_id" value={passport.id} />
          <input
            name="condition_name"
            placeholder="Condition (e.g. Asthma)"
            required
            className="flex-1 rounded-md border border-foreground/20 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            Add
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Emergency contacts</h2>
        <ul className="space-y-2">
          {contacts?.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-md border border-foreground/15 px-4 py-2"
            >
              <span>
                {c.name} <span className="text-foreground/50">({c.relationship})</span>
              </span>
              <span className="font-mono text-sm">{c.phone}</span>
            </li>
          ))}
          {!contacts?.length && (
            <p className="text-sm text-foreground/50">None recorded.</p>
          )}
        </ul>
        <form action={addIceContact} className="flex flex-wrap gap-2">
          <input type="hidden" name="passport_id" value={passport.id} />
          <input
            name="name"
            placeholder="Name"
            required
            className="flex-1 rounded-md border border-foreground/20 px-3 py-2 text-sm"
          />
          <input
            name="relationship"
            placeholder="Relationship"
            required
            className="w-32 rounded-md border border-foreground/20 px-3 py-2 text-sm"
          />
          <input
            name="phone"
            placeholder="Phone"
            required
            className="w-40 rounded-md border border-foreground/20 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            Add
          </button>
        </form>
      </section>
    </main>
  );
}
