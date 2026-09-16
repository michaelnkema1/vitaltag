"use client";

import { useState } from "react";
import { PassportQr } from "@/components/PassportQr";
import { Printer, X, CreditCard, ShieldCheck } from "lucide-react";

interface WalletCardPrintProps {
  qrToken: string;
  fullName: string;
}

export function WalletCardPrint({ qrToken, fullName }: WalletCardPrintProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-background-elevated px-4 py-2 text-xs font-semibold text-brand transition hover:bg-brand/10"
      >
        <CreditCard className="h-4 w-4" /> Print Physical Emergency Card
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-brand/20 bg-background p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand/15 pb-4 print:hidden">
              <div>
                <h3 className="font-display text-xl font-semibold">Print VitalTag Physical Card</h3>
                <p className="text-xs text-brand/70">
                  Zero-PHI wallet card containing only the cardholder name and QR pointer token
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-brand/60 hover:bg-brand/10 hover:text-brand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Wallet Printable Card Container — Zero PHI */}
            <div id="printable-card" className="mx-auto max-w-sm rounded-3xl border-2 border-brand bg-cream p-6 text-brand space-y-6 shadow-md text-center">
              <div className="flex items-center justify-between border-b border-brand/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand">
                    <span className="h-2 w-2 rounded-full bg-brand" />
                  </span>
                  <span className="font-display text-base font-bold tracking-tight">VitalTag</span>
                </div>
                <span className="rounded-full bg-brand px-2.5 py-0.5 text-[0.65rem] font-bold text-cream uppercase">
                  Emergency Passport
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-brand/60">
                  Cardholder Name
                </p>
                <h4 className="font-display text-2xl font-bold text-brand truncate">{fullName}</h4>
              </div>

              <div className="flex justify-center py-2">
                <PassportQr token={qrToken} />
              </div>

              <div className="pt-2 border-t border-brand/15 flex items-center justify-center gap-1.5 text-xs text-brand/70">
                <ShieldCheck className="h-4 w-4 text-brand shrink-0" />
                <span className="text-[0.7rem] font-medium">
                  Scan code in emergency for verified crash data
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 print:hidden pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-brand/20 px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/10"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2 text-xs font-semibold text-cream hover:bg-brand-dark transition"
              >
                <Printer className="h-4 w-4" /> Print Card
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
