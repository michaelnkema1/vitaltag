import Link from "next/link";

export function SiteHeader() {
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

        <nav className="hidden items-center gap-5 text-sm font-medium sm:flex">
          <Link href="/#how-it-works" className="transition hover:opacity-70">
            How it works
          </Link>
          <Link href="/#access" className="transition hover:opacity-70">
            Access
          </Link>
          <Link href="/#for-hospitals" className="transition hover:opacity-70">
            Hospitals
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
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
        </div>
      </div>
    </header>
  );
}
