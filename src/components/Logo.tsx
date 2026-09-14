export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 2.5 27 7v8.2c0 8.1-5.4 13.6-11 14.3-5.6-.7-11-6.2-11-14.3V7l11-4.5Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path
        d="M16 2.5 27 7v8.2c0 8.1-5.4 13.6-11 14.3-5.6-.7-11-6.2-11-14.3V7l11-4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 17h3.2l1.8-4 2.6 8 1.8-4h5.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="size-7 text-brand" />
      <span className="font-display text-lg font-semibold tracking-tight text-brand">
        VitalTag
      </span>
    </span>
  );
}
