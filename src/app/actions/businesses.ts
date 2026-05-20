"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendBusinessApprovalEmail } from "@/lib/email";
import { createSignupInvite } from "@/lib/invite";
import type {
  Business,
  PageQuery,
  PageResult,
  PendingBusiness,
} from "@/types/business";

const SELECT_COLS = "id,email,submitted_at,category,budget_range,promotion_target,is_approved";

type BusinessLeadRow = {
  id: string;
  email: string;
  submitted_at: string;
  category: string | null;
  budget_range: string | null;
  promotion_target: string | null;
  is_approved: boolean;
};

function sanitizeSearch(search: string): string {
  return search.replace(/[%_,().]/g, " ").trim();
}

function rowToPending(row: BusinessLeadRow): PendingBusiness {
  return {
    id: row.id,
    email: row.email,
    submittedAt: row.submitted_at,
    category: row.category ?? null,
    budgetRange: row.budget_range ?? null,
    promotionTarget: row.promotion_target ?? null,
  };
}

function rowToBusiness(row: BusinessLeadRow): Business {
  return {
    id: row.id,
    email: row.email,
    category: row.category ?? null,
    budgetRange: row.budget_range ?? null,
    promotionTarget: row.promotion_target ?? null,
  };
}

export async function fetchPendingBusinesses({
  offset,
  limit,
  search,
}: PageQuery): Promise<PageResult<PendingBusiness>> {
  let query = getSupabaseAdmin()
    .from("business_leads")
    .select(SELECT_COLS, { count: "exact" })
    .eq("is_approved", false);

  const safe = search ? sanitizeSearch(search) : "";
  if (safe) {
    query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`fetchPendingBusinesses: ${error.message}`);

  return {
    items: ((data ?? []) as BusinessLeadRow[]).map(rowToPending),
    total: count ?? 0,
  };
}

export async function fetchApprovedBusinesses({
  offset,
  limit,
  search,
}: PageQuery): Promise<PageResult<Business>> {
  let query = getSupabaseAdmin()
    .from("business_leads")
    .select(SELECT_COLS, { count: "exact" })
    .eq("is_approved", true);

  const safe = search ? sanitizeSearch(search) : "";
  if (safe) {
    query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`fetchApprovedBusinesses: ${error.message}`);

  return {
    items: ((data ?? []) as BusinessLeadRow[]).map(rowToBusiness),
    total: count ?? 0,
  };
}

export async function approveBusiness(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: lead, error: selectError } = await supabase
    .from("business_leads")
    .select("email")
    .eq("id", id)
    .single();

  if (selectError) throw new Error(`approveBusiness: ${selectError.message}`);

  const { error } = await supabase
    .from("business_leads")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) throw new Error(`approveBusiness: ${error.message}`);

  try {
    const invite = await createSignupInvite(id, "business");
    await sendBusinessApprovalEmail(lead.email, invite.code);
  } catch (e) {
    console.error("Failed to send business approval email:", e);
  }

  revalidatePath("/pending-businesses");
  revalidatePath("/verified-businesses");
}

export async function revokeBusinessApproval(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("business_leads")
    .update({ is_approved: false })
    .eq("id", id);

  if (error) throw new Error(`revokeBusinessApproval: ${error.message}`);

  revalidatePath("/verified-businesses");
  revalidatePath("/pending-businesses");
}
