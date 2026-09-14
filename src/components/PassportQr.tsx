"use client";

import { QRCodeSVG } from "qrcode.react";

export function PassportQr({ token }: { token: string }) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/emergency/${token}`
      : `/emergency/${token}`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-foreground/15 p-6">
      <QRCodeSVG value={url} size={160} />
      <p className="max-w-[200px] break-all text-center font-mono text-xs text-foreground/50">
        {url}
      </p>
    </div>
  );
}
