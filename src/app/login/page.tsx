import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

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
        <form
          action={signIn}
          className="w-full max-w-md space-y-5 rounded-3xl border border-brand/15 bg-background-elevated p-8 shadow-[0_24px_50px_-28px_rgb(var(--shadow-color)/0.4)]"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] uppercase">
              Welcome back
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Log in</h1>
          </div>

          {error && (
            <p className="rounded-xl bg-emergency-warn-bg px-3 py-2 text-sm text-emergency-fg">
              {error}
            </p>
          )}

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
              className="w-full rounded-xl border border-brand/20 px-3 py-2.5"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-brand py-3 font-semibold text-cream transition hover:bg-brand-dark"
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
      </main>
      <SiteFooter />
    </>
  );
}
