"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BloodGroup } from "@/lib/supabase/types";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function createPassport(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const blood_group = String(formData.get("blood_group")) as BloodGroup;

  const { error } = await supabase
    .from("passports")
    .insert({ user_id: userId, blood_group });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function addAllergy(formData: FormData) {
  const { supabase } = await requireUserId();
  const passport_id = String(formData.get("passport_id"));
  const substance = String(formData.get("substance"));
  const severity = String(formData.get("severity")) as
    | "mild"
    | "moderate"
    | "severe";

  const { error } = await supabase
    .from("allergies")
    .insert({ passport_id, substance, severity });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function addChronicCondition(formData: FormData) {
  const { supabase } = await requireUserId();
  const passport_id = String(formData.get("passport_id"));
  const condition_name = String(formData.get("condition_name"));

  const { error } = await supabase
    .from("chronic_conditions")
    .insert({ passport_id, condition_name });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function addIceContact(formData: FormData) {
  const { supabase } = await requireUserId();
  const passport_id = String(formData.get("passport_id"));
  const name = String(formData.get("name"));
  const relationship = String(formData.get("relationship"));
  const phone = String(formData.get("phone"));

  const { error } = await supabase
    .from("ice_contacts")
    .insert({ passport_id, name, relationship, phone });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
