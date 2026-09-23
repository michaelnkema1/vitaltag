"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
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
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return { supabase, userId: user.id };
}

export async function updateUserRole(formData: FormData) {
  const { supabase } = await requireAdmin();

  const targetUserId = String(formData.get("target_user_id"));
  const newRole = String(formData.get("role")) as "patient" | "responder" | "clinician" | "admin";

  if (!targetUserId || !newRole) {
    redirect("/admin?error=" + encodeURIComponent("Missing user ID or role choice"));
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    redirect("/admin?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/terminal");
  redirect("/admin?role_updated=true");
}

export async function addPharmacy(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name"));
  const address = String(formData.get("address"));
  const phone = String(formData.get("phone") || "");
  const lat = parseFloat(String(formData.get("lat") || "5.6037"));
  const lng = parseFloat(String(formData.get("lng") || "-0.1870"));

  if (!name || !address) {
    redirect("/admin?error=" + encodeURIComponent("Pharmacy name and address are required"));
  }

  const { error } = await supabase.from("pharmacies").insert({
    name,
    address,
    phone: phone || null,
    lat,
    lng,
  });

  if (error) {
    redirect("/admin?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/terminal");
  redirect("/admin?pharmacy_added=true");
}

export async function claimAdminRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Authentication required"));
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id);

  if (error) {
    redirect("/admin?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/terminal");
  redirect("/admin");
}
