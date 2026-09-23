"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Ensure admin@vitaltag.demo has admin role in profiles table upon sign in
  if (email.toLowerCase() === "admin@vitaltag.demo" && data?.user) {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
  }

  // Redirect to dashboard where both patients and clinicians can view patient info,
  // with role-aware options to view full clinical details or visit terminal.
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("full_name"));
  const role = String(formData.get("role") || "patient");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(`/signup?checkEmail=${encodeURIComponent(email)}`);
  }

  if (data?.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName || (data.user.user_metadata?.full_name ?? "User"),
      role: (role || data.user.user_metadata?.role || "patient") as any,
    }, { onConflict: "id" });
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
