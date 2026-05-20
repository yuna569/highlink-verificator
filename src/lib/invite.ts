import { randomInt } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// I, O, 0, 1 제외 — 육안으로 헷갈리는 문자를 빼서 입력 오류 방지
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 7;
const EXPIRES_DAYS = 30;
const MAX_ATTEMPTS = 5;

export type InviteRole = "creator" | "business";

export type SignupInvite = {
  id: string;
  code: string;
  role: InviteRole;
  leadId: string;
  expiresAt: string;
};

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return code;
}

export async function createSignupInvite(
  leadId: string,
  role: InviteRole,
): Promise<SignupInvite> {
  const supabase = getSupabaseAdmin();

  // 이미 유효한 초대가 있으면 그대로 반환 (중복 발급 방지)
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("signup_invites")
    .select("id, code, role, lead_id, expires_at")
    .eq("role", role)
    .eq("lead_id", leadId)
    .is("used_at", null)
    .is("revoked_at", null)
    .gt("expires_at", now)
    .limit(1)
    .single();

  if (existing) {
    return {
      id: existing.id,
      code: existing.code,
      role: existing.role,
      leadId: existing.lead_id,
      expiresAt: existing.expires_at,
    };
  }

  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + EXPIRES_DAYS);
  const expiresAtIso = expiresAt.toISOString();

  // code unique 제약 충돌 시 최대 5회 재시도
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateCode();

    const { data, error } = await supabase
      .from("signup_invites")
      .insert({ code, role, lead_id: leadId, expires_at: expiresAtIso })
      .select("id, code, role, lead_id, expires_at")
      .single();

    if (error) {
      // code 컬럼 unique 충돌이면 다른 코드로 재시도, 그 외 에러는 즉시 throw
      if (/signup_invites_code|Key \(code\)/i.test(error.message)) continue;
      throw new Error(`createSignupInvite: ${error.message}`);
    }

    return {
      id: data.id,
      code: data.code,
      role: data.role,
      leadId: data.lead_id,
      expiresAt: data.expires_at,
    };
  }

  throw new Error("Could not generate a unique signup invite code after 5 attempts.");
}
