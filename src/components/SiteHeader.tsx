import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Stethoscope, User, LogOut, ShieldCheck, ShieldAlert } from "lucide-react";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string; role: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  const isClinician = profile?.role === "clinician" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-brand/15 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand">
            <span className="h-3 w-3 rounded-full bg-brand" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            VitalTag
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link href="/#how-it-works" className="transition hover:opacity-70">
            How it works
          </Link>
          <Link href="/#access" className="transition hover:opacity-70">
            Access Model
          </Link>
          {user && (
            <Link href="/dashboard" className="transition hover:opacity-70">
              Dashboard
            </Link>
          )}
          {isClinician && (
            <Link
              href="/terminal"
              className="flex items-center gap-1.5 font-semibold text-brand transition hover:opacity-80"
            >
              <Stethoscope className="h-4 w-4" /> Hospital Terminal
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 font-bold text-emergency-accent transition hover:opacity-80"
            >
              <ShieldAlert className="h-4 w-4" /> Admin Portal
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-brand/20 bg-background-elevated px-3 py-1 text-xs">
                {isClinician ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-brand shrink-0" />
                ) : (
                  <User className="h-3.5 w-3.5 text-brand shrink-0" />
                )}
                <span className="font-semibold text-brand truncate max-w-[120px]">
                  {profile?.full_name ?? user.email}
                </span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[0.65rem] uppercase text-brand font-semibold">
                  {profile?.role ?? "user"}
                </span>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full bg-emergency-accent px-3 py-1 text-xs font-bold text-cream transition hover:bg-opacity-90 sm:hidden"
                >
                  Admin
                </Link>
              )}

              <form action={signOut}>
                <button
                  type="submit"
                  title="Log out"
                  className="rounded-full p-2 text-brand/70 hover:bg-brand/10 hover:text-brand transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden px-3 py-2 font-medium transition hover:opacity-70 sm:inline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand px-4 py-2 font-semibold text-cream transition hover:bg-brand-dark"
              >
                Get a passport
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
