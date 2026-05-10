"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSession, deleteSession } from "@/lib/auth";

type LoginState = { error: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return { error: "아이디와 비밀번호를 입력해주세요." };
  }

  const supabase = getSupabaseAdmin();
  const { data: admin, error } = await supabase
    .from("admins")
    .select("id, username, password_hash")
    .eq("username", username)
    .single();

  if (error || !admin) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession(String(admin.id), admin.username);
  redirect("/pending-influencers");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
