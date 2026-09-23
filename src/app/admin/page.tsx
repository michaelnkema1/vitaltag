import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { updateUserRole, addPharmacy, claimAdminRole } from "@/lib/actions/admin";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ShieldAlert,
  Users,
  Stethoscope,
  CreditCard,
  Eye,
  Store,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Plus,
  ArrowUpRight,
} from "lucide-react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    role_updated?: string;
    pharmacy_added?: string;
  }>;
}) {
  const { error: queryError, role_updated, pharmacy_added } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // Middleware redirects unauthenticated users

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <div className="rounded-full bg-emergency-warn-bg p-4 text-emergency-accent">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h1 className="font-display text-3xl font-semibold">401 — Admin Portal Restricted</h1>
          <p className="max-w-md text-sm leading-relaxed text-brand/70">
            This administrative control panel requires an authenticated <strong>admin</strong> role. Your current account role is &quot;{profile?.role ?? "unknown"}&quot;.
          </p>
          <form action={claimAdminRole} className="mt-4">
            <button
              type="submit"
              className="rounded-full bg-emergency-accent px-6 py-2.5 text-sm font-semibold text-cream shadow-md transition hover:bg-opacity-90 inline-flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" /> Elevate Account to Admin Role
            </button>
          </form>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Parallel data fetching for admin metrics, profiles, passports, pharmacies, and audit logs
  const [
    { data: profiles },
    { data: passports },
    { data: pharmacies },
    { data: auditLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("passports").select("id, user_id, blood_group, created_at"),
    supabase.from("pharmacies").select("*").order("name"),
    supabase.from("access_audit_log").select("*").order("accessed_at", { ascending: false }).limit(15),
  ]);

  const totalUsers = profiles?.length ?? 0;
  const totalClinicians = profiles?.filter((p) => p.role === "clinician" || p.role === "admin").length ?? 0;
  const totalPatients = profiles?.filter((p) => p.role === "patient").length ?? 0;
  const totalPassports = passports?.length ?? 0;
  const totalAudits = auditLogs?.length ?? 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-12">
        {/* Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emergency-accent/30 bg-background-elevated p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emergency-accent/15 p-3 text-emergency-accent">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Admin Control Portal</h1>
              <p className="flex items-center gap-2 text-xs text-brand/70">
                <UserCheck className="h-3.5 w-3.5 text-brand" /> Administrator:{" "}
                <span className="font-semibold">{profile.full_name}</span>
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
        {queryError && (
          <div className="rounded-2xl bg-emergency-warn-bg p-4 text-sm text-emergency-fg flex items-center gap-2 border border-emergency-accent/30">
            <AlertTriangle className="h-4 w-4 shrink-0 text-emergency-accent" />
            <span>{queryError}</span>
          </div>
        )}
        {role_updated && (
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-800 flex items-center gap-2 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>User role updated successfully.</span>
          </div>
        )}
        {pharmacy_added && (
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-800 flex items-center gap-2 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Partner community pharmacy onboarded successfully.</span>
          </div>
        )}

        {/* System Overview Metrics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-brand/15 bg-cream p-6">
            <div className="flex items-center justify-between text-brand/60">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
              <Users className="h-5 w-5" />
            </div>
            <p className="mt-2 font-display text-4xl font-bold text-brand">{totalUsers}</p>
            <p className="mt-1 text-xs text-brand/60">{totalPatients} Patients · {totalClinicians} Clinicians</p>
          </div>

          <div className="rounded-3xl border border-brand/15 bg-cream p-6">
            <div className="flex items-center justify-between text-brand/60">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Clinicians</span>
              <Stethoscope className="h-5 w-5" />
            </div>
            <p className="mt-2 font-display text-4xl font-bold text-brand">{totalClinicians}</p>
            <p className="mt-1 text-xs text-brand/60">Hospital Triage Authorized</p>
          </div>

          <div className="rounded-3xl border border-brand/15 bg-cream p-6">
            <div className="flex items-center justify-between text-brand/60">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Passports</span>
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="mt-2 font-display text-4xl font-bold text-brand">{totalPassports}</p>
            <p className="mt-1 text-xs text-brand/60">Issued QR Pointer Tokens</p>
          </div>

          <div className="rounded-3xl border border-brand/15 bg-cream p-6">
            <div className="flex items-center justify-between text-brand/60">
              <span className="text-xs font-semibold uppercase tracking-wider">Audit Scans Logged</span>
              <Eye className="h-5 w-5" />
            </div>
            <p className="mt-2 font-display text-4xl font-bold text-brand">{totalAudits}</p>
            <p className="mt-1 text-xs text-brand/60">Tier 1 & Tier 2 Activity</p>
          </div>
        </div>

        {/* User Management & Clinician Verification Table */}
        <section className="rounded-3xl border border-brand/15 bg-background-elevated p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Clinician Verification & User RBAC</h2>
              <p className="text-xs text-brand/60">
                Manage user roles, verify clinician account requests, and grant hospital terminal privileges
              </p>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              {profiles?.length} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-brand/15 bg-cream">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-brand/15 bg-brand/5 uppercase tracking-wider font-semibold text-brand/70">
                <tr>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/10">
                {profiles?.map((p) => (
                  <tr key={p.id} className="hover:bg-background-elevated/50 transition">
                    <td className="p-4 font-semibold text-brand">{p.full_name}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-bold uppercase text-[0.65rem] ${
                          p.role === "admin"
                            ? "bg-emergency-accent/20 text-emergency-accent"
                            : p.role === "clinician"
                            ? "bg-brand/15 text-brand"
                            : "bg-foreground/10 text-foreground/70"
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="p-4 text-brand/60 font-mono">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <form action={updateUserRole} className="inline-flex items-center gap-2">
                        <input type="hidden" name="target_user_id" value={p.id} />
                        <select
                          name="role"
                          defaultValue={p.role}
                          className="rounded-xl border border-brand/20 bg-background-elevated px-3 py-1.5 text-xs text-brand"
                        >
                          <option value="patient">Patient</option>
                          <option value="clinician">Clinician</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-xl bg-brand px-3 py-1.5 font-semibold text-cream hover:bg-brand-dark transition"
                        >
                          Update
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pharmacy Network Onboarding */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Add Pharmacy Form */}
          <div className="rounded-3xl border border-brand/15 bg-cream p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-brand" />
              <h2 className="font-display text-xl font-semibold">Onboard Partner Pharmacy</h2>
            </div>
            <p className="text-xs text-brand/70 leading-relaxed">
              Add new licensed dispensaries into the post-triage medication hold network:
            </p>

            <form action={addPharmacy} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="pharmacy_name" className="text-xs font-semibold uppercase tracking-wider text-brand/70">
                  Pharmacy Name
                </label>
                <input
                  id="pharmacy_name"
                  name="name"
                  placeholder="e.g. HealthFirst Community Dispensary"
                  required
                  className="w-full rounded-xl border border-brand/20 px-4 py-2.5 text-sm bg-background-elevated"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="pharmacy_address" className="text-xs font-semibold uppercase tracking-wider text-brand/70">
                  Address / Sector Location
                </label>
                <input
                  id="pharmacy_address"
                  name="address"
                  placeholder="e.g. 54 Ridge Road, East Sector"
                  required
                  className="w-full rounded-xl border border-brand/20 px-4 py-2.5 text-sm bg-background-elevated"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="pharmacy_phone" className="text-xs font-semibold uppercase tracking-wider text-brand/70">
                  Phone Contact
                </label>
                <input
                  id="pharmacy_phone"
                  name="phone"
                  placeholder="e.g. +233-30-299-8800"
                  className="w-full rounded-xl border border-brand/20 px-4 py-2.5 text-sm bg-background-elevated"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-brand py-3 font-semibold text-cream transition hover:bg-brand-dark inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Onboard Pharmacy
              </button>
            </form>
          </div>

          {/* Active Pharmacy List */}
          <div className="rounded-3xl border border-brand/15 bg-background-elevated p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Active Dispensary Network</h2>
              <span className="text-xs text-brand/60 font-semibold">{pharmacies?.length} Locations</span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {pharmacies?.map((pharmacy) => (
                <div key={pharmacy.id} className="rounded-2xl border border-brand/15 bg-cream p-4 text-xs space-y-1">
                  <p className="font-bold text-brand">{pharmacy.name}</p>
                  <p className="text-brand/70">{pharmacy.address}</p>
                  {pharmacy.phone && (
                    <p className="font-mono text-brand font-medium">{pharmacy.phone}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Access Audit Feed */}
        <section className="rounded-3xl border border-brand/15 bg-background-elevated p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand" />
            <div>
              <h2 className="font-display text-xl font-semibold">Global System Access Audit Feed</h2>
              <p className="text-xs text-brand/60">
                System-wide security logs recording all Tier 1 emergency scans and Tier 2 hospital queries
              </p>
            </div>
          </div>

          <div className="divide-y divide-brand/10 overflow-hidden rounded-2xl border border-brand/15 bg-cream text-xs">
            {auditLogs?.map((log) => {
              const accessedAt = new Date(log.accessed_at);
              const meta = log.metadata as Record<string, unknown> | null;
              const viaText = typeof meta?.via === "string" ? meta.via : "QR Scan";

              return (
                <div key={log.id} className="flex items-center justify-between p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-bold uppercase text-[0.6rem] ${
                          log.tier === 1
                            ? "bg-emergency-accent/20 text-emergency-accent"
                            : "bg-brand/15 text-brand"
                        }`}
                      >
                        Tier {log.tier} {log.tier === 1 ? "Field Crash Scan" : "Hospital Ledger Scan"}
                      </span>
                      <span className="font-mono text-brand/60 text-[0.65rem]">
                        Passport ID: {log.passport_id.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-brand/80 font-medium">Via {viaText}</p>
                  </div>
                  <span className="font-mono text-brand/60">
                    {accessedAt.toLocaleDateString()} {accessedAt.toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
