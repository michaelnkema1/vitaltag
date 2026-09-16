"use client";

import { useState } from "react";
import { createMedicationHold, cancelMedicationHold } from "@/lib/actions/pharmacy";
import { Store, Clock, MapPin, Phone, CheckCircle, AlertCircle, XCircle, Pill } from "lucide-react";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  lat: number;
  lng: number;
}

interface MedicationHold {
  id: string;
  medication_name: string;
  status: string;
  held_until: string;
  created_at: string;
  pharmacies: { name: string; address: string; phone: string | null } | null;
}

interface PharmacyHoldsProps {
  passportId: string;
  pharmacies: Pharmacy[];
  holds: MedicationHold[];
  redirectUrl: string;
}

export function PharmacyHolds({ passportId, pharmacies, holds, redirectUrl }: PharmacyHoldsProps) {
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>(pharmacies[0]?.id || "");
  const [medicationName, setMedicationName] = useState<string>("");

  return (
    <div className="space-y-6">
      {/* Existing Medication Holds */}
      {holds.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand/70 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand" /> Active 60-Minute Prescription Holds
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {holds.map((hold) => {
              const expiresAt = new Date(hold.held_until);
              const isExpired = new Date() > expiresAt || hold.status === "expired";
              const isCancelled = hold.status === "cancelled";

              return (
                <div
                  key={hold.id}
                  className={`rounded-2xl border p-4 space-y-2 transition shadow-sm ${
                    isCancelled
                      ? "border-foreground/10 bg-foreground/5 opacity-60"
                      : isExpired
                      ? "border-emergency-accent/30 bg-emergency-warn-bg"
                      : "border-brand/20 bg-cream"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5 text-brand">
                      <Pill className="h-4 w-4" /> {hold.medication_name}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase ${
                        isCancelled
                          ? "bg-foreground/10 text-foreground/60"
                          : isExpired
                          ? "bg-emergency-accent/20 text-emergency-accent"
                          : "bg-emerald-500/15 text-emerald-700"
                      }`}
                    >
                      {isCancelled ? "Cancelled" : isExpired ? "Expired" : "Active Hold (60m)"}
                    </span>
                  </div>

                  {hold.pharmacies && (
                    <div className="text-xs text-brand/70 space-y-0.5">
                      <p className="font-medium">{hold.pharmacies.name}</p>
                      <p className="flex items-center gap-1 text-brand/50">
                        <MapPin className="h-3 w-3 shrink-0" /> {hold.pharmacies.address}
                      </p>
                      {hold.pharmacies.phone && (
                        <p className="flex items-center gap-1 font-mono text-brand">
                          <Phone className="h-3 w-3 shrink-0" /> {hold.pharmacies.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {!isCancelled && !isExpired && (
                    <div className="pt-2 flex items-center justify-between border-t border-brand/10">
                      <span className="text-[0.65rem] text-brand/60 font-mono">
                        Expires: {expiresAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <form action={cancelMedicationHold}>
                        <input type="hidden" name="hold_id" value={hold.id} />
                        <input type="hidden" name="redirect_url" value={redirectUrl} />
                        <button
                          type="submit"
                          className="text-[0.65rem] font-semibold text-emergency-accent hover:underline flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3" /> Cancel Hold
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Place New 60-Minute Medication Hold */}
      <div className="rounded-2xl border border-brand/15 bg-background-elevated p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-brand" />
          <div>
            <h4 className="font-display text-lg font-semibold">Post-Triage Pharmacy Hold</h4>
            <p className="text-xs text-brand/60">
              Reserve critical medications for 60 minutes at nearby partner dispensaries
            </p>
          </div>
        </div>

        <form action={createMedicationHold} className="space-y-4">
          <input type="hidden" name="passport_id" value={passportId} />
          <input type="hidden" name="redirect_url" value={redirectUrl} />

          <div className="space-y-1">
            <label htmlFor="medication_name_input" className="text-xs font-semibold uppercase tracking-wider text-brand/70">
              Prescription Formulation
            </label>
            <input
              id="medication_name_input"
              name="medication_name"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="e.g. Albuterol HFA Inhaler, Amoxicillin 500mg, Insulin Glargine"
              required
              className="w-full rounded-xl border border-brand/20 px-4 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="pharmacy_select" className="text-xs font-semibold uppercase tracking-wider text-brand/70">
              Select Partner Pharmacy Network
            </label>
            <select
              id="pharmacy_select"
              name="pharmacy_id"
              value={selectedPharmacyId}
              onChange={(e) => setSelectedPharmacyId(e.target.value)}
              required
              className="w-full rounded-xl border border-brand/20 px-4 py-2.5 text-sm bg-background-elevated"
            >
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name} — {pharmacy.address}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!medicationName.trim()}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-cream transition hover:bg-brand-dark disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <Clock className="h-4 w-4" /> Reserve 60-Minute Post-Triage Hold
          </button>
        </form>
      </div>
    </div>
  );
}
