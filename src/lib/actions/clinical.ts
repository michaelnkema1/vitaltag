"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireClinician() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Authentication required"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "clinician" && profile.role !== "admin")) {
    throw new Error("Unauthorized: Clinician or Admin role required");
  }

  return { supabase, userId: user.id };
}

export async function saveClinicalRecord(formData: FormData) {
  const { supabase, userId } = await requireClinician();

  const passportId = String(formData.get("passport_id"));
  const qrToken = String(formData.get("qr_token"));
  const doctorNotes = String(formData.get("doctor_notes") || "");
  const diagnosisInput = String(formData.get("diagnosis_history") || "");
  const prescriptionsInput = String(formData.get("prescriptions") || "");

  // Convert comma or newline separated strings to JSON arrays
  const diagnosisHistory = diagnosisInput
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const prescriptions = prescriptionsInput
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const { data: existingRecord } = await supabase
    .from("clinical_records")
    .select("id")
    .eq("passport_id", passportId)
    .maybeSingle();

  let error;

  if (existingRecord) {
    const res = await supabase
      .from("clinical_records")
      .update({
        doctor_notes: doctorNotes,
        diagnosis_history: diagnosisHistory,
        prescriptions: prescriptions,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRecord.id);
    error = res.error;
  } else {
    const res = await supabase.from("clinical_records").insert({
      passport_id: passportId,
      doctor_notes: doctorNotes,
      diagnosis_history: diagnosisHistory,
      prescriptions: prescriptions,
      updated_by: userId,
    });
    error = res.error;
  }

  if (error) {
    redirect(
      `/terminal?token=${encodeURIComponent(qrToken)}&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/terminal");
  redirect(`/terminal?token=${encodeURIComponent(qrToken)}&saved=true`);
}
