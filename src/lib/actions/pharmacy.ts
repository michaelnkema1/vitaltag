"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMedicationHold(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Authentication required"));
  }

  const passportId = String(formData.get("passport_id"));
  const pharmacyId = String(formData.get("pharmacy_id"));
  const medicationName = String(formData.get("medication_name"));
  const redirectUrl = String(formData.get("redirect_url") || "/dashboard");

  if (!passportId || !pharmacyId || !medicationName) {
    redirect(`${redirectUrl}?error=${encodeURIComponent("Missing required hold fields")}`);
  }

  const heldUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("medication_holds").insert({
    passport_id: passportId,
    pharmacy_id: pharmacyId,
    medication_name: medicationName,
    status: "pending",
    held_until: heldUntil,
  });

  if (error) {
    console.error("Medication hold creation error:", error);
    redirect(`${redirectUrl}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/terminal");
  redirect(`${redirectUrl}?hold_success=true`);
}

export async function cancelMedicationHold(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Authentication required"));
  }

  const holdId = String(formData.get("hold_id"));
  const redirectUrl = String(formData.get("redirect_url") || "/dashboard");

  const { error } = await supabase
    .from("medication_holds")
    .update({ status: "cancelled" })
    .eq("id", holdId);

  if (error) {
    redirect(`${redirectUrl}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/terminal");
  redirect(`${redirectUrl}?hold_cancelled=true`);
}
