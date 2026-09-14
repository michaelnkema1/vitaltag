export function PassportCardMock() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        aria-hidden
        className="absolute -top-10 -left-8 h-40 w-40 rounded-full bg-brand/15 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -right-6 -bottom-8 h-32 w-32 rounded-full bg-brand/10 blur-2xl"
      />

      <div className="relative rotate-3 rounded-[1.75rem] border border-brand/20 bg-background-elevated p-3 shadow-[0_28px_60px_-24px_rgb(var(--shadow-color)/0.45)]">
        <div className="overflow-hidden rounded-[1.35rem] bg-brand p-6 text-cream">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.28em] uppercase opacity-70">
                Emergency passport
              </p>
              <p className="mt-2 font-display text-2xl font-semibold">VitalTag</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/40">
              <span className="h-2.5 w-2.5 rounded-full bg-cream" />
            </span>
          </div>

          <div className="mt-10 grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase opacity-60">
                Blood group
              </p>
              <p className="font-display text-5xl leading-none font-semibold">
                O+
              </p>
              <p className="mt-3 text-xs opacity-70">Pointer only · no PHI in QR</p>
            </div>
            <div className="rounded-xl bg-cream p-2.5 text-brand">
              <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden>
                <rect width="80" height="80" fill="#E5DABE" />
                <rect x="6" y="6" width="22" height="22" fill="#217868" />
                <rect x="52" y="6" width="22" height="22" fill="#217868" />
                <rect x="6" y="52" width="22" height="22" fill="#217868" />
                <rect x="34" y="6" width="6" height="22" fill="#217868" />
                <rect x="34" y="34" width="12" height="12" fill="#217868" />
                <rect x="52" y="34" width="22" height="6" fill="#217868" />
                <rect x="34" y="52" width="6" height="22" fill="#217868" />
                <rect x="52" y="52" width="10" height="10" fill="#217868" />
                <rect x="68" y="64" width="6" height="10" fill="#217868" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 max-w-[11rem] -rotate-6 rounded-2xl border border-brand/15 bg-background-elevated px-4 py-3 shadow-lg">
        <p className="text-[0.65rem] tracking-[0.18em] uppercase text-brand/60">
          Scan result
        </p>
        <p className="mt-1 text-sm font-semibold">Penicillin · severe</p>
      </div>
    </div>
  );
}
