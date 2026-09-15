"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export function PassportQr({ token }: { token: string }) {
  const [url, setUrl] = useState(`/emergency/${token}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/emergency/${token}`);
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand/15 bg-background-elevated p-6 shadow-sm">
      <QRCodeSVG value={url} size={160} />
      <p className="max-w-[220px] break-all text-center font-mono text-xs text-brand/60">
        {url}
      </p>
    </div>
  );
}
