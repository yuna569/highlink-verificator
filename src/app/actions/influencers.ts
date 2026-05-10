"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendApprovalEmail } from "@/lib/email";
import type {
  FollowerCounts,
  Influencer,
  PageQuery,
  PageResult,
  PendingInfluencer,
  SocialChannel,
} from "@/types/influencer";

const KNOWN_CHANNELS: SocialChannel[] = ["instagram", "youtube", "tiktok"];

const SELECT_COLS =
  "id,name,email,created_at,social_channels,instagram_id,tiktok_id,youtube_id,instagram_follower_count,tiktok_follower_count,youtube_follower_count,is_approved";

type CreatorLeadRow = {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
  social_channels: string[] | null;
  instagram_id: string | null;
  tiktok_id: string | null;
  youtube_id: string | null;
  instagram_follower_count: number | null;
  tiktok_follower_count: number | null;
  youtube_follower_count: number | null;
  is_approved: boolean;
};

function activeChannels(row: CreatorLeadRow): SocialChannel[] {
  const raw = row.social_channels ?? [];
  return raw
    .map((c) => c.toLowerCase())
    .filter((c): c is SocialChannel =>
      KNOWN_CHANNELS.includes(c as SocialChannel),
    );
}

function rowToVerified(row: CreatorLeadRow): Influencer {
  const socials: FollowerCounts = {};
  if (row.instagram_follower_count !== null) {
    socials.instagram = row.instagram_follower_count;
  }
  if (row.youtube_follower_count !== null) {
    socials.youtube = row.youtube_follower_count;
  }
  if (row.tiktok_follower_count !== null) {
    socials.tiktok = row.tiktok_follower_count;
  }
  return {
    id: row.id,
    name: row.name?.trim() || row.email,
    email: row.email,
    socials,
  };
}

function rowToPending(row: CreatorLeadRow): PendingInfluencer {
  const channels: Partial<Record<SocialChannel, string>> = {};
  for (const channel of activeChannels(row)) {
    const handle =
      channel === "instagram"
        ? row.instagram_id
        : channel === "youtube"
          ? row.youtube_id
          : row.tiktok_id;
    channels[channel] = handle ?? "";
  }
  return {
    id: row.id,
    name: row.name?.trim() || row.email,
    email: row.email,
    createdAt: row.created_at,
    channels,
  };
}

/**
 * Sanitize user search input for use in a PostgREST `.or()` filter string.
 * Removes characters that have meaning in the filter syntax (`,`, `(`, `)`, `.`)
 * and the SQL `LIKE` wildcards (`%`, `_`).
 */
function sanitizeSearch(search: string): string {
  return search.replace(/[%_,().]/g, " ").trim();
}

function buildFollowerUpdates(
  followers: FollowerCounts,
): Record<string, number | null> {
  const updates: Record<string, number | null> = {};
  if ("instagram" in followers) {
    updates.instagram_follower_count = followers.instagram ?? null;
  }
  if ("youtube" in followers) {
    updates.youtube_follower_count = followers.youtube ?? null;
  }
  if ("tiktok" in followers) {
    updates.tiktok_follower_count = followers.tiktok ?? null;
  }
  return updates;
}

export async function fetchVerifiedInfluencers({
  offset,
  limit,
  search,
}: PageQuery): Promise<PageResult<Influencer>> {
  let query = getSupabaseAdmin()
    .from("creator_leads")
    .select(SELECT_COLS, { count: "exact" })
    .eq("is_approved", true);

  const safe = search ? sanitizeSearch(search) : "";
  if (safe) {
    query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`fetchVerifiedInfluencers: ${error.message}`);

  return {
    items: ((data ?? []) as CreatorLeadRow[]).map(rowToVerified),
    total: count ?? 0,
  };
}

export async function fetchPendingInfluencers({
  offset,
  limit,
  search,
}: PageQuery): Promise<PageResult<PendingInfluencer>> {
  let query = getSupabaseAdmin()
    .from("creator_leads")
    .select(SELECT_COLS, { count: "exact" })
    .eq("is_approved", false);

  const safe = search ? sanitizeSearch(search) : "";
  if (safe) {
    query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`fetchPendingInfluencers: ${error.message}`);

  return {
    items: ((data ?? []) as CreatorLeadRow[]).map(rowToPending),
    total: count ?? 0,
  };
}

export async function saveFollowerCounts(
  id: string,
  followers: FollowerCounts,
): Promise<void> {
  const updates = buildFollowerUpdates(followers);
  if (Object.keys(updates).length === 0) return;

  const { error } = await getSupabaseAdmin()
    .from("creator_leads")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(`saveFollowerCounts: ${error.message}`);
  revalidatePath("/verified-influencers");
}

export async function approveInfluencer(
  id: string,
  followers: FollowerCounts,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: lead, error: selectError } = await supabase
    .from("creator_leads")
    .select("email, name")
    .eq("id", id)
    .single();

  if (selectError) throw new Error(`approveInfluencer: ${selectError.message}`);

  const updates: Record<string, number | null | boolean> = {
    ...buildFollowerUpdates(followers),
    is_approved: true,
  };

  const { error } = await supabase
    .from("creator_leads")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(`approveInfluencer: ${error.message}`);

  try {
    const name = lead.name?.trim() || lead.email;
    await sendApprovalEmail(lead.email, name);
  } catch (e) {
    console.error("Failed to send approval email:", e);
  }

  revalidatePath("/pending-influencers");
  revalidatePath("/verified-influencers");
}

export async function revokeApproval(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("creator_leads")
    .update({
      is_approved: false,
      instagram_follower_count: null,
      tiktok_follower_count: null,
      youtube_follower_count: null,
    })
    .eq("id", id);

  if (error) throw new Error(`revokeApproval: ${error.message}`);
  revalidatePath("/verified-influencers");
  revalidatePath("/pending-influencers");
}
