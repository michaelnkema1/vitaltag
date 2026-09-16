"use client";

import { useState } from "react";
import { PassportQr } from "@/components/PassportQr";
import { Printer, ShieldCheck, Phone, X, CreditCard } from "lucide-react";

interface WalletCardPrintProps {
  bloodGroup: string;
  qrToken: string;
  fullName: string;
  allergies: { substance: string; severity: string }[];
  contacts: { name: string; relationship: string; phone: string }[];
}

export function WalletCardPrint({ bloodGroup, qrToken, fullName, allergies, contacts }: WalletCardPrintProps) {
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
                <h3 className="font-display text-xl font-semibold">Print VitalTag Emergency Card</h3>
                <p className="text-xs text-brand/70">
                  Wallet-sized emergency pass for first responders
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-brand/60 hover:bg-brand/10 hover:text-brand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Wallet Printable Card Container */}
            <div id="printable-card" className="mx-auto max-w-sm rounded-2xl border-2 border-brand bg-cream p-5 text-brand space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-brand/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand">
                    <span className="h-2 w-2 rounded-full bg-brand" />
                  </span>
                  <span className="font-display text-base font-bold tracking-tight">VitalTag</span>
                </div>
                <span className="rounded-full bg-brand px-2.5 py-0.5 text-[0.65rem] font-bold text-cream uppercase">
                  Emergency Pass
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="space-y-1">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand/60">
                    Cardholder
                  </p>
                  <p className="font-bold text-base truncate">{fullName}</p>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand/60 pt-1">
                    Blood Group
                  </p>
                  <p className="font-display text-3xl font-extrabold">{bloodGroup}</p>
                </div>
                <PassportQr token={qrToken} />
              </div>

              {allergies.length > 0 && (
                <div className="rounded-xl border border-brand/20 bg-background-elevated p-2.5 text-xs space-y-1">
                  <p className="font-bold text-[0.65rem] uppercase text-emergency-accent">
                    Critical Allergies:
                  </p>
                  <p className="font-medium truncate">
                    {allergies.map((a) => a.substance).join(", ")}
                  </p>
                </div>
              )}

              {contacts.length > 0 && (
                <div className="text-xs pt-1 border-t border-brand/15 flex items-center justify-between">
                  <span className="font-semibold text-[0.65rem] uppercase text-brand/70">
                    ICE Contact: {contacts[0].name} ({contacts[0].relationship})
                  </span>
                  <span className="font-mono font-bold text-xs">{contacts[0].phone}</span>
                </div>
              )}

              <div className="text-center pt-1">
                <p className="font-mono text-[0.6rem] text-brand/50">
                  Zero-PHI Ephemeral Token: {qrToken.slice(0, 16)}...
                </p>
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
