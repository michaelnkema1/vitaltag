import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkEmail?: string }>;
}) {
  const { error, checkEmail } = await searchParams;

  if (checkEmail) {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-md space-y-5 rounded-3xl border border-brand/15 bg-background-elevated p-8 text-center shadow-[0_24px_50px_-28px_rgb(var(--shadow-color)/0.4)]">
            <p className="text-xs font-semibold tracking-[0.24em] uppercase">
              Almost there
            </p>
            <h1 className="font-display text-3xl font-semibold">
              Check your email
            </h1>
            <p className="text-sm leading-relaxed text-brand/70">
              We sent a confirmation link to{" "}
              <span className="font-semibold text-brand">{checkEmail}</span>.
              Click it to activate your account, then log in below.
            </p>
            <Link
              href="/login"
              className="inline-block w-full rounded-full bg-brand py-3 font-semibold text-cream transition hover:bg-brand-dark"
            >
              Go to log in
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <form
          action={signUp}
          className="w-full max-w-md space-y-5 rounded-3xl border border-brand/15 bg-background-elevated p-8 shadow-[0_24px_50px_-28px_rgb(var(--shadow-color)/0.4)]"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] uppercase">
              New passport
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">
              Create an account
            </h1>
          </div>

          {error && (
            <p className="rounded-xl bg-emergency-warn-bg px-3 py-2 text-sm text-emergency-fg">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="full_name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              className="w-full rounded-xl border border-brand/20 px-3 py-2.5"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-brand/20 px-3 py-2.5"
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
              minLength={6}
              className="w-full rounded-xl border border-brand/20 px-3 py-2.5"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-medium">
              Account type
            </label>
            <select
              id="role"
              name="role"
              defaultValue="patient"
              className="w-full rounded-xl border border-brand/20 px-3 py-2.5"
            >
              <option value="patient">Patient</option>
              <option value="clinician">Clinician (hospital terminal)</option>
            </select>
            <p className="text-xs text-brand/50">
              Demo only — in production, clinician accounts must be verified
              and granted by an admin, not self-selected at signup.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-brand py-3 font-semibold text-cream transition hover:bg-brand-dark"
          >
            Sign up
          </button>

          <p className="text-center text-sm text-brand/65">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold underline underline-offset-4">
              Log in
            </Link>
          </p>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
