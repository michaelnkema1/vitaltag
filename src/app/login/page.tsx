import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Stethoscope, User, ArrowRight, ShieldCheck } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-6">
          <form
            action={signIn}
            className="w-full space-y-5 rounded-3xl border border-brand/15 bg-background-elevated p-8 shadow-[0_24px_50px_-28px_rgb(var(--shadow-color)/0.4)]"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] uppercase text-brand/60">
                Welcome back
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold">Log in</h1>
            </div>

            {error && (
              <p className="rounded-2xl bg-emergency-warn-bg px-4 py-2.5 text-sm text-emergency-fg border border-emergency-accent/30">
                {error}
              </p>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your.name@example.com"
                className="w-full rounded-2xl border border-brand/20 px-4 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-2xl border border-brand/20 px-4 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-brand py-3.5 font-semibold text-cream transition hover:bg-brand-dark"
            >
              Log in
            </button>

            <p className="text-center text-sm text-brand/65">
              No account?{" "}
              <Link href="/signup" className="font-semibold underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </form>

          {/* One-Click Quick Demo Login Shortcuts */}
          <div className="rounded-3xl border border-brand/20 bg-cream p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-brand">
              <ShieldCheck className="h-4 w-4" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">
                Quick Demo Sign-In
              </h2>
            </div>
            <p className="text-xs text-brand/70 leading-relaxed">
              Use pre-seeded demo credentials to test patient and clinician workflows instantly:
            </p>

            <div className="grid gap-3">
              {/* Clinician Demo Button */}
              <form action={signIn}>
                <input type="hidden" name="email" value="clinician@vitaltag.demo" />
                <input type="hidden" name="password" value="Password123!" />
                <button
                  type="submit"
                  className="w-full flex items-center justify-between rounded-2xl border border-brand/20 bg-background-elevated p-3.5 text-left transition hover:border-brand hover:shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-brand/10 p-2.5 text-brand">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand">Clinician Demo</p>
                      <p className="text-xs text-brand/60">Dr. Sarah Jenkins (Hospital Terminal)</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-brand/40 group-hover:text-brand transition" />
                </button>
              </form>

              {/* Patient Demo Button */}
              <form action={signIn}>
                <input type="hidden" name="email" value="patient@vitaltag.demo" />
                <input type="hidden" name="password" value="Password123!" />
                <button
                  type="submit"
                  className="w-full flex items-center justify-between rounded-2xl border border-brand/20 bg-background-elevated p-3.5 text-left transition hover:border-brand hover:shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-brand/10 p-2.5 text-brand">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand">Patient Demo</p>
                      <p className="text-xs text-brand/60">John Doe (Passport & Emergency ICE)</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-brand/40 group-hover:text-brand transition" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
