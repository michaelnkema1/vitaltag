import { createClient } from "@/lib/supabase/server";
import type { EmergencySnapshot } from "@/lib/supabase/types";

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_emergency_snapshot", {
    p_token: token,
  });

  const snapshot = data as EmergencySnapshot | null;

  if (error || !snapshot) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-emergency-bg px-6 py-16 text-emergency-fg">
        <p className="text-xl font-semibold">No VitalTag found for this code.</p>
        <p className="mt-2 text-sm text-emergency-fg/60">
          The token is invalid, or the passport has been deleted.
        </p>
      </main>
    );
  }

  const severeAllergies = snapshot.allergies.filter(
    (a) => a.severity === "severe",
  );
  const otherAllergies = snapshot.allergies.filter(
    (a) => a.severity !== "severe",
  );

  return (
    <main className="flex-1 bg-emergency-bg px-6 py-10 text-emergency-fg">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emergency-accent">
            VitalTag — Emergency Crash Data
          </p>
          <p className="mt-1 text-xs text-emergency-fg/50">
            No login required. Full clinical history is not shown here.
          </p>
        </div>

        <section className="rounded-lg border border-emergency-fg/15 p-5">
          <p className="text-sm text-emergency-fg/60">Blood group</p>
          <p className="text-5xl font-bold">{snapshot.blood_group}</p>
        </section>

        {severeAllergies.length > 0 && (
          <section className="rounded-lg border-2 border-emergency-accent bg-emergency-warn-bg p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emergency-accent">
              Severe allergies
            </p>
            <ul className="mt-2 space-y-1 text-lg font-semibold">
              {severeAllergies.map((a, i) => (
                <li key={i}>{a.substance}</li>
              ))}
            </ul>
          </section>
        )}

        {otherAllergies.length > 0 && (
          <section className="rounded-lg border border-emergency-fg/15 p-5">
            <p className="text-sm text-emergency-fg/60">Other allergies</p>
            <ul className="mt-2 space-y-1">
              {otherAllergies.map((a, i) => (
                <li key={i}>
                  {a.substance}{" "}
                  <span className="text-xs uppercase text-emergency-fg/50">
                    ({a.severity})
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {snapshot.chronic_conditions.length > 0 && (
          <section className="rounded-lg border border-emergency-fg/15 p-5">
            <p className="text-sm text-emergency-fg/60">Chronic conditions</p>
            <ul className="mt-2 space-y-1">
              {snapshot.chronic_conditions.map((c, i) => (
                <li key={i}>{c.condition_name}</li>
              ))}
            </ul>
          </section>
        )}

        {snapshot.ice_contacts.length > 0 && (
          <section className="rounded-lg border border-emergency-fg/15 p-5">
            <p className="text-sm text-emergency-fg/60">Emergency contacts</p>
            <ul className="mt-3 space-y-3">
              {snapshot.ice_contacts.map((c, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>
                    {c.name}{" "}
                    <span className="text-xs text-emergency-fg/50">
                      ({c.relationship})
                    </span>
                  </span>
                  <a
                    href={`tel:${c.phone}`}
                    className="rounded-md bg-emergency-accent px-4 py-2 text-sm font-semibold text-emergency-bg"
                  >
                    Call {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
