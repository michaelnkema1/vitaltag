"use server";

import { redirect } from "next/navigation";
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

// Server Actions bound directly to a <form action={...}> have no client-side
// catch: a thrown error just fails the request with no visible feedback, and
// on the create-passport form specifically, a failed insert re-renders the
// exact same "set up your passport" form -- indistinguishable from success
// having silently done nothing. Route every failure back through a visible
// ?error= banner on /dashboard instead of throwing.
function failDashboard(message: string): never {
  redirect(`/dashboard?error=${encodeURIComponent(message)}`);
}

export async function createPassport(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const blood_group = String(formData.get("blood_group")) as BloodGroup;

  // Ensure profile row exists in public.profiles to satisfy passports_user_id_fkey foreign key constraint
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const metaFullName = String(
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
    );
    const metaRole = String(user?.user_metadata?.role || "patient") as any;

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: metaFullName,
        role: metaRole,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      failDashboard(`Profile initialization failed: ${profileError.message}`);
    }
  }

  const { error } = await supabase
    .from("passports")
    .insert({ user_id: userId, blood_group });

  if (error) failDashboard(error.message);
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

  if (error) failDashboard(error.message);
  revalidatePath("/dashboard");
}

export async function addChronicCondition(formData: FormData) {
  const { supabase } = await requireUserId();
  const passport_id = String(formData.get("passport_id"));
  const condition_name = String(formData.get("condition_name"));

  const { error } = await supabase
    .from("chronic_conditions")
    .insert({ passport_id, condition_name });

  if (error) failDashboard(error.message);
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

  if (error) failDashboard(error.message);
  revalidatePath("/dashboard");
}
