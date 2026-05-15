"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import { formatFollowerCount } from "@/lib/format";
import type {
  FollowerCounts,
  Influencer,
  SocialChannel,
} from "@/types/influencer";

const CHANNEL_LABEL: Record<SocialChannel, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

const CHANNEL_ICON: Record<SocialChannel, string> = {
  instagram: "/instagram.png",
  youtube: "/youtube.png",
  tiktok: "/tiktok.png",
};

const CHANNEL_URL: Record<SocialChannel, string> = {
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
  tiktok: "https://tiktok.com/",
};

const CHANNEL_ORDER: SocialChannel[] = ["instagram", "youtube", "tiktok"];

type StatCellProps = {
  channel: SocialChannel;
  count: number | undefined;
  draftValue: string;
  isEditing: boolean;
  position: "first" | "middle" | "last";
  onStartEdit: () => void;
  onChange: (value: string) => void;
};

function StatCell({
  channel,
  count,
  draftValue,
  isEditing,
  position,
  onStartEdit,
  onChange,
}: StatCellProps) {
  const positionClass =
    position === "middle"
      ? "md:border-x md:border-border-subtle md:px-sm"
      : position === "last"
        ? "md:pl-sm"
        : "";

  return (
    <div className={`space-y-xs ${positionClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-sm">
          <Image
            src={CHANNEL_ICON[channel]}
            alt=""
            width={22}
            height={22}
            className="h-[22px] w-[22px] rounded"
            unoptimized
          />
          <span
            className={`min-w-0 text-label-sm ${
              isEditing ? "text-charcoal" : "text-on-surface-variant"
            }`}
          >
            <a
              href={CHANNEL_URL[channel]}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate transition-all hover:underline"
            >
              {CHANNEL_LABEL[channel]}
            </a>
          </span>
        </div>
        {isEditing ? (
          <MaterialIcon
            name="check_circle"
            filled
            className="text-[16px] text-sage-green"
          />
        ) : (
          <button
            type="button"
            aria-label={`Edit ${CHANNEL_LABEL[channel]} followers`}
            onClick={onStartEdit}
            className="text-on-surface-variant hover:text-charcoal"
          >
            <MaterialIcon name="edit_square" className="text-[16px]" />
          </button>
        )}
      </div>
      {isEditing ? (
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={draftValue}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          className="text-h3 w-full rounded border border-charcoal bg-white px-2 py-1 text-charcoal focus:outline-none focus:ring-0"
        />
      ) : (
        <p className="text-h3 text-charcoal">{formatFollowerCount(count)}</p>
      )}
    </div>
  );
}

type InfluencerCardProps = {
  influencer: Influencer;
  onSave?: (id: string, socials: FollowerCounts) => void | Promise<void>;
  onRevoke?: (id: string) => void | Promise<void>;
};

export default function InfluencerCard({
  influencer,
  onSave,
  onRevoke,
}: InfluencerCardProps) {
  const channels = useMemo(
    () => CHANNEL_ORDER.filter((c) => influencer.socials[c] !== undefined),
    [influencer.socials],
  );

  const [draft, setDraft] = useState<Partial<Record<SocialChannel, string>>>(
    () =>
      Object.fromEntries(
        channels.map((c) => [c, String(influencer.socials[c] ?? "")]),
      ),
  );
  const [editingChannels, setEditingChannels] = useState<Set<SocialChannel>>(
    new Set(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const isEditing = editingChannels.size > 0;

  const handleStartEdit = (channel: SocialChannel) => {
    setEditingChannels((prev) => {
      const next = new Set(prev);
      next.add(channel);
      return next;
    });
  };

  const handleChange = (channel: SocialChannel, value: string) => {
    setDraft((prev) => ({ ...prev, [channel]: value }));
  };

  const handleCancel = () => {
    setDraft(
      Object.fromEntries(
        channels.map((c) => [c, String(influencer.socials[c] ?? "")]),
      ),
    );
    setEditingChannels(new Set());
  };

  const handleSave = async () => {
    const parsed: FollowerCounts = {};
    for (const channel of editingChannels) {
      const raw = (draft[channel] ?? "").trim();
      if (raw === "") continue;
      const n = Number(raw);
      if (Number.isFinite(n) && Number.isInteger(n) && n >= 0) {
        parsed[channel] = n;
      }
    }
    if (Object.keys(parsed).length === 0) {
      setEditingChannels(new Set());
      return;
    }
    setIsSaving(true);
    try {
      await onSave?.(influencer.id, parsed);
      setEditingChannels(new Set());
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async () => {
    const confirmed = window.confirm(
      `${influencer.name}님의 승인을 취소하시겠습니까?\n팔로워 수가 모두 초기화되고 승인 대기 상태로 돌아갑니다.`,
    );
    if (!confirmed) return;
    setIsRevoking(true);
    try {
      await onRevoke?.(influencer.id);
    } finally {
      setIsRevoking(false);
    }
  };

  const cardBorderClass = isEditing
    ? "border-charcoal/20 shadow-sm"
    : "border-border-subtle group";

  return (
    <div
      className={`influencer-card relative rounded-xl border bg-surface-container-lowest p-lg transition-all ${cardBorderClass}`}
    >
      <div className="text-label-sm absolute right-lg top-lg rounded border border-sage-green/30 bg-sage-green/5 px-sm py-xs uppercase tracking-wider text-sage-green">
        Approved
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

      <div className="grid grid-cols-1 gap-md rounded-lg bg-surface-canvas p-md md:grid-cols-3 md:gap-sm">
        {channels.map((channel, idx) => (
          <StatCell
            key={channel}
            channel={channel}
            count={influencer.socials[channel]}
            draftValue={draft[channel] ?? ""}
            isEditing={editingChannels.has(channel)}
            position={
              idx === 0
                ? "first"
                : idx === channels.length - 1
                  ? "last"
                  : "middle"
            }
            onStartEdit={() => handleStartEdit(channel)}
            onChange={(v) => handleChange(channel, v)}
          />
        ))}
      </div>

      {isEditing ? (
        <div className="mt-md flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-1 text-[12px] text-status-amber">
            <MaterialIcon name="info" className="text-[14px]" />
            수정 중인 데이터가 있습니다
          </p>
          <div className="flex gap-sm self-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-label-sm rounded border border-border-subtle px-md py-1.5 text-on-surface-variant hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="text-label-sm rounded bg-sage-green px-md py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-md flex justify-end gap-sm transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
          <button
            type="button"
            onClick={handleRevoke}
            disabled={isRevoking}
            className="text-label-sm flex items-center gap-1 rounded border border-status-red/30 bg-status-red/5 px-md py-1.5 text-status-red transition-all hover:border-status-red hover:bg-status-red/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MaterialIcon name="undo" className="text-[16px]" />
            {isRevoking ? "취소 중..." : "승인 취소"}
          </button>
        </div>
      )}
    </div>
  );
}
