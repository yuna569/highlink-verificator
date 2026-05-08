"use client";

import { useMemo, useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import type {
  FollowerCounts,
  PendingInfluencer,
  SocialChannel,
} from "@/types/influencer";

const CHANNEL_LABEL: Record<SocialChannel, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

const CHANNEL_BASE_URL: Record<SocialChannel, string> = {
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/@",
  tiktok: "https://tiktok.com/@",
};

const CHANNEL_ORDER: SocialChannel[] = ["instagram", "youtube", "tiktok"];

function buildChannelUrl(channel: SocialChannel, handle: string): string {
  if (!handle) return "#";
  if (handle.startsWith("http://") || handle.startsWith("https://")) {
    return handle;
  }
  return `${CHANNEL_BASE_URL[channel]}${handle.replace(/^@/, "")}`;
}

function parseCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return null;
  return n;
}

type FollowerInputProps = {
  channel: SocialChannel;
  handle: string;
  value: string;
  position: "first" | "middle" | "last";
  onChange: (value: string) => void;
};

function FollowerInput({
  channel,
  handle,
  value,
  position,
  onChange,
}: FollowerInputProps) {
  const positionClass =
    position === "middle"
      ? "border-x border-border-subtle px-sm"
      : position === "last"
        ? "pl-sm"
        : "";

  return (
    <div className={`space-y-xs ${positionClass}`}>
      <a
        href={buildChannelUrl(channel, handle)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-label-sm flex items-center gap-1 uppercase text-on-surface-variant transition-colors hover:text-charcoal hover:underline"
      >
        {CHANNEL_LABEL[channel]}
        <MaterialIcon name="open_in_new" className="text-[12px]" />
      </a>
      <p className="text-body-md truncate text-on-surface-variant">
        {handle ? `@${handle.replace(/^@/, "")}` : "—"}
      </p>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="팔로워 수"
        className="text-h3 w-full rounded border border-border-subtle bg-white px-2 py-1 text-charcoal focus:border-charcoal focus:outline-none focus:ring-0"
      />
    </div>
  );
}

type PendingInfluencerCardProps = {
  influencer: PendingInfluencer;
  onApprove?: (id: string, followers: FollowerCounts) => void | Promise<void>;
};

export default function PendingInfluencerCard({
  influencer,
  onApprove,
}: PendingInfluencerCardProps) {
  const activeChannels = useMemo(
    () => CHANNEL_ORDER.filter((c) => influencer.channels[c] !== undefined),
    [influencer.channels],
  );

  const [followers, setFollowers] = useState<
    Partial<Record<SocialChannel, string>>
  >(() => Object.fromEntries(activeChannels.map((c) => [c, ""])));
  const [isApproving, setIsApproving] = useState(false);

  const allFilled = activeChannels.every(
    (c) => parseCount(followers[c] ?? "") !== null,
  );

  const handleChange = (channel: SocialChannel, value: string) => {
    setFollowers((prev) => ({ ...prev, [channel]: value }));
  };

  const handleApprove = async () => {
    if (!allFilled) return;
    const parsed: FollowerCounts = {};
    for (const channel of activeChannels) {
      const n = parseCount(followers[channel] ?? "");
      if (n !== null) parsed[channel] = n;
    }
    setIsApproving(true);
    try {
      await onApprove?.(influencer.id, parsed);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="influencer-card group relative rounded-xl border border-border-subtle bg-surface-container-lowest p-lg transition-all">
      <div className="text-label-sm absolute right-lg top-lg rounded border border-status-amber/30 bg-status-amber/5 px-sm py-xs uppercase tracking-wider text-status-amber">
        Pending
      </div>

      <div className="mb-lg flex items-start">
        <div>
          <h3 className="text-h3 text-charcoal">{influencer.name}</h3>
          <p className="text-body-md text-on-surface-variant">
            {influencer.email}
          </p>
          <p className="text-label-sm mt-1 text-on-surface-variant">
            ID: {influencer.id}
          </p>
        </div>
      </div>

      {activeChannels.length === 0 ? (
        <div className="rounded-lg bg-surface-canvas p-md text-center">
          <p className="text-label-sm text-on-surface-variant">
            활동 중인 소셜 채널 정보가 없습니다
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-sm rounded-lg bg-surface-canvas p-md">
          {activeChannels.map((channel, idx) => (
            <FollowerInput
              key={channel}
              channel={channel}
              handle={influencer.channels[channel] ?? ""}
              value={followers[channel] ?? ""}
              position={
                idx === 0
                  ? "first"
                  : idx === activeChannels.length - 1
                    ? "last"
                    : "middle"
              }
              onChange={(v) => handleChange(channel, v)}
            />
          ))}
        </div>
      )}

      <div className="mt-md flex items-center justify-between">
        <p className="text-label-sm text-on-surface-variant">
          {activeChannels.length === 0
            ? "승인 불가"
            : allFilled
              ? "모든 채널의 팔로워 수가 입력되었습니다"
              : `${activeChannels.length}개 채널의 팔로워 수를 모두 입력해주세요`}
        </p>
        <button
          type="button"
          onClick={handleApprove}
          disabled={!allFilled || isApproving || activeChannels.length === 0}
          className="text-label-sm flex items-center gap-1 rounded bg-sage-green px-md py-1.5 text-white transition-all disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-on-surface-variant"
        >
          <MaterialIcon name="check" className="text-[16px]" />
          {isApproving ? "승인 중..." : "승인하기"}
        </button>
      </div>
    </div>
  );
}
