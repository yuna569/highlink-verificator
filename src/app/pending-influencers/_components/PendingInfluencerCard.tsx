"use client";

import Image from "next/image";
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

const CHANNEL_ICON: Record<SocialChannel, string> = {
  instagram: "/instagram.png",
  youtube: "/youtube.png",
  tiktok: "/tiktok.png",
};

const CHANNEL_BASE_URL: Record<SocialChannel, string> = {
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/@",
  tiktok: "https://tiktok.com/@",
};

const CHANNEL_ORDER: SocialChannel[] = ["instagram", "youtube", "tiktok"];

const REVIEW_CRITERIA = [
  {
    key: "followers",
    label: "팔로워 규모",
  },
  {
    key: "content",
    label: "콘텐츠 질",
  },
  {
    key: "engagement",
    label: "참여율",
  },
] as const;

type ReviewCriterion = (typeof REVIEW_CRITERIA)[number]["key"];
export type ReviewStatus = "pending" | "rejected";

const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "신청대기",
  rejected: "반려",
};

const REVIEW_STATUS_CLASS: Record<ReviewStatus, string> = {
  pending: "border-status-blue/25 bg-status-blue/5 text-status-blue",
  rejected: "border-status-red/30 bg-status-red/5 text-status-red",
};

const SUBMITTED_AT_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

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

function formatSubmittedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "접수일 확인 필요";
  return SUBMITTED_AT_FORMATTER.format(date);
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

type FollowerInputProps = {
  influencerId: string;
  channel: SocialChannel;
  handle: string;
  value: string;
  onChange: (value: string) => void;
};

function FollowerInput({
  influencerId,
  channel,
  handle,
  value,
  onChange,
}: FollowerInputProps) {
  const inputId = `${influencerId}-${channel}-followers`;

  return (
    <div className="min-w-0 border-b border-border-subtle p-md last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="mb-sm flex min-w-0 items-center gap-sm">
        <Image
          src={CHANNEL_ICON[channel]}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 rounded"
          unoptimized
        />
        <div className="min-w-0">
          <a
            href={buildChannelUrl(channel, handle)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-label-sm text-charcoal transition-colors hover:underline"
          >
            {CHANNEL_LABEL[channel]}
            <MaterialIcon name="open_in_new" className="text-[12px]" />
          </a>
          <p className="truncate text-body-md text-on-surface-variant">
            {handle ? `@${handle.replace(/^@/, "")}` : "핸들 없음"}
          </p>
        </div>
      </div>
      <label
        htmlFor={inputId}
        className="mb-xs block text-label-sm text-on-surface-variant"
      >
        팔로워 수
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="h-10 w-full rounded-lg border border-border-subtle bg-white px-sm text-h3 text-charcoal focus:border-charcoal focus:outline-none focus:ring-0"
      />
    </div>
  );
}

type PendingInfluencerCardProps = {
  influencer: PendingInfluencer;
  status: ReviewStatus;
  onStatusChange?: (id: string, status: ReviewStatus) => void;
  onApprove?: (id: string, followers: FollowerCounts) => void | Promise<void>;
};

export default function PendingInfluencerCard({
  influencer,
  status,
  onStatusChange,
  onApprove,
}: PendingInfluencerCardProps) {
  const activeChannels = useMemo(
    () => CHANNEL_ORDER.filter((c) => influencer.channels[c] !== undefined),
    [influencer.channels],
  );

  const [followers, setFollowers] = useState<
    Partial<Record<SocialChannel, string>>
  >(() => Object.fromEntries(activeChannels.map((c) => [c, ""])));
  const [reviewScores, setReviewScores] = useState<
    Record<ReviewCriterion, number>
  >({
    followers: 0,
    content: 0,
    engagement: 0,
  });
  const [isApproving, setIsApproving] = useState(false);

  const allFilled = activeChannels.every(
    (c) => parseCount(followers[c] ?? "") !== null,
  );
  const filledCount = activeChannels.filter(
    (c) => parseCount(followers[c] ?? "") !== null,
  ).length;
  const totalFollowers = activeChannels.reduce((sum, channel) => {
    const parsed = parseCount(followers[channel] ?? "");
    return parsed === null ? sum : sum + parsed;
  }, 0);
  const ratedCount = REVIEW_CRITERIA.filter(
    (item) => reviewScores[item.key] > 0,
  ).length;
  const reviewComplete = ratedCount === REVIEW_CRITERIA.length;
  const reviewScoreTotal = REVIEW_CRITERIA.reduce(
    (sum, item) => sum + reviewScores[item.key],
    0,
  );
  const averageScore =
    ratedCount === 0 ? 0 : reviewScoreTotal / REVIEW_CRITERIA.length;
  const canApprove =
    activeChannels.length > 0 &&
    allFilled &&
    reviewComplete &&
    status === "pending";
  const readinessMessage =
    activeChannels.length === 0
      ? "활동 채널 정보가 없어 승인할 수 없습니다"
      : !allFilled
        ? `팔로워 수 ${filledCount}/${activeChannels.length} 입력`
        : !reviewComplete
          ? `심사 점수 ${ratedCount}/${REVIEW_CRITERIA.length} 입력`
          : status !== "pending"
            ? `${REVIEW_STATUS_LABEL[status]} 상태입니다`
            : "승인 기준 확인 완료";
  const shortId = influencer.id.slice(0, 8);

  const handleChange = (channel: SocialChannel, value: string) => {
    setFollowers((prev) => ({ ...prev, [channel]: value }));
  };

  const handleScoreChange = (criterion: ReviewCriterion, score: number) => {
    setReviewScores((prev) => ({
      ...prev,
      [criterion]: prev[criterion] === score ? 0 : score,
    }));
  };

  const handleApprove = async () => {
    if (!canApprove) return;
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
    <article className="influencer-card rounded-lg border border-border-subtle bg-surface-container-lowest p-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all">
      <div className="flex flex-col gap-md lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-sm flex flex-wrap items-center gap-xs">
            {status === "rejected" && (
              <span
                className={`rounded-lg border px-sm py-xs text-label-sm ${REVIEW_STATUS_CLASS[status]}`}
              >
                {REVIEW_STATUS_LABEL[status]}
              </span>
            )}
            <span className="rounded-lg border border-border-subtle bg-surface-canvas px-sm py-xs text-label-sm text-on-surface-variant">
              접수 {formatSubmittedAt(influencer.createdAt)}
            </span>
            <span className="rounded-lg border border-border-subtle bg-surface-canvas px-sm py-xs text-label-sm text-on-surface-variant">
              채널 {activeChannels.length}개
            </span>
          </div>
          <h3 className="truncate text-h3 text-charcoal">{influencer.name}</h3>
          <p className="truncate text-body-md text-on-surface-variant">
            {influencer.email}
          </p>
          <p className="mt-1 font-mono text-[12px] text-on-surface-variant">
            LEAD-{shortId}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-sm lg:w-[260px]">
          <div className="rounded-lg border border-border-subtle bg-surface-canvas px-sm py-xs">
            <p className="text-label-sm text-on-surface-variant">입력 규모</p>
            <p className="text-label-md text-charcoal">
              {filledCount > 0 ? formatCompactNumber(totalFollowers) : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-canvas px-sm py-xs">
            <p className="text-label-sm text-on-surface-variant">심사 점수</p>
            <p className="text-label-md text-charcoal">
              {ratedCount > 0 ? `${averageScore.toFixed(1)}/5` : "-"}
            </p>
          </div>
        </div>
      </div>

      {activeChannels.length === 0 ? (
        <div className="mt-lg rounded-lg border border-border-subtle bg-surface-canvas p-md text-center">
          <p className="text-label-sm text-on-surface-variant">
            활동 중인 소셜 채널 정보가 없습니다
          </p>
        </div>
      ) : (
        <div className="mt-lg overflow-hidden rounded-lg border border-border-subtle bg-surface-canvas md:grid md:grid-cols-3">
          {activeChannels.map((channel) => (
            <FollowerInput
              key={channel}
              influencerId={influencer.id}
              channel={channel}
              handle={influencer.channels[channel] ?? ""}
              value={followers[channel] ?? ""}
              onChange={(v) => handleChange(channel, v)}
            />
          ))}
        </div>
      )}

      <div className="mt-md border-t border-border-subtle pt-md">
        <div className="mb-sm flex flex-col gap-xs sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-label-md text-charcoal">심사 점수</h4>
          <span className="text-label-sm text-on-surface-variant">
            팔로워 규모 · 콘텐츠 질 · 참여율
          </span>
        </div>
        <div className="grid gap-xs lg:grid-cols-3">
          {REVIEW_CRITERIA.map((item) => {
            const score = reviewScores[item.key];
            return (
              <div
                key={item.key}
                className="rounded-lg border border-border-subtle bg-white px-sm py-sm"
              >
                <div className="mb-xs flex items-center justify-between gap-sm">
                  <span className="text-label-md text-charcoal">
                    {item.label}
                  </span>
                  <span className="text-label-sm text-on-surface-variant">
                    {score > 0 ? `${score}/5` : "미입력"}
                  </span>
                </div>
                <div
                  className="flex gap-1"
                  role="radiogroup"
                  aria-label={`${item.label} 점수`}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const selected = score >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={score === star}
                        aria-label={`${item.label} ${star}점`}
                        onClick={() => handleScoreChange(item.key, star)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-surface-container-low"
                      >
                        <MaterialIcon
                          name="star"
                          filled={selected}
                          className={`text-[22px] ${
                            selected
                              ? "text-status-amber"
                              : "text-outline-variant"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-md flex flex-col gap-md border-t border-border-subtle pt-md lg:flex-row lg:items-center lg:justify-end">
        <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-end">
          <p className="text-label-sm text-on-surface-variant">
            {readinessMessage}
          </p>
          <button
            type="button"
            onClick={() => onStatusChange?.(influencer.id, "rejected")}
            disabled={status === "rejected" || isApproving}
            className="flex h-10 items-center justify-center gap-xs rounded-lg border border-status-red/30 bg-status-red/5 px-lg text-label-md text-status-red transition-all hover:border-status-red hover:bg-status-red/10 disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-container-high disabled:text-on-surface-variant"
          >
            <MaterialIcon name="cancel" className="text-[18px]" />
            {status === "rejected" ? "반려됨" : "반려"}
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!canApprove || isApproving}
            className="flex h-10 items-center justify-center gap-xs rounded-lg bg-sage-green px-lg text-label-md text-white transition-all hover:bg-sage-green/90 disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-on-surface-variant"
          >
            <MaterialIcon name="check" className="text-[18px]" />
            {isApproving ? "승인 중..." : "승인"}
          </button>
        </div>
      </div>
    </article>
  );
}
