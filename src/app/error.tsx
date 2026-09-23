"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("VitalTag Global Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-16 text-center text-brand">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-brand/15 bg-background-elevated p-8 shadow-[0_24px_50px_-28px_rgb(var(--shadow-color)/0.4)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emergency-warn-bg text-emergency-accent">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="text-xs text-brand/70 leading-relaxed">
            We encountered an unexpected error while loading this page. Please try reloading or returning home.
          </p>
          {error.digest && (
            <p className="font-mono text-[0.65rem] text-brand/40">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-cream transition hover:bg-brand-dark"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>

          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand/20 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            <Home className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
