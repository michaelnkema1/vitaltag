import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand/15">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-xl font-semibold">VitalTag</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand/70">
            Dynamic emergency medical identity. A QR pointer on a card, crash
            data in two seconds, full ledger only for verified clinicians.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase">
            Product
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/dashboard" className="hover:underline">
                Patient dashboard
              </Link>
            </li>
            <li>
              <Link href="/terminal" className="hover:underline">
                Hospital terminal
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:underline">
                Create an account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase">
            Access
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Tier 1 — emergency crash data</li>
            <li>Tier 2 — clinical ledger</li>
            <li>Zero-data QR pointer</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand/10">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs text-brand/55">
          VitalTag is an MVP scaffold. Emergency scans never encode medical
          data in the QR itself.
        </p>
      </div>
    </footer>
  );
}
