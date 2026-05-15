"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import AppShell from "@/components/AppShell";
import LoadMore from "@/components/LoadMore";
import MaterialIcon from "@/components/MaterialIcon";
import SearchBar from "@/components/SearchBar";
import {
  approveInfluencer,
  fetchPendingInfluencers,
} from "@/app/actions/influencers";
import type {
  FollowerCounts,
  PendingInfluencer,
} from "@/types/influencer";
import PendingInfluencerCard, {
  type ReviewStatus,
} from "./PendingInfluencerCard";

type PendingInfluencersViewProps = {
  initialItems: PendingInfluencer[];
  initialTotal: number;
  pageSize: number;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function PendingInfluencersView({
  initialItems,
  initialTotal,
  pageSize,
}: PendingInfluencersViewProps) {
  const [items, setItems] = useState<PendingInfluencer[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusById, setStatusById] = useState<Record<string, ReviewStatus>>(
    {},
  );
  const [approvedCount, setApprovedCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const skipFirstRefetch = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (skipFirstRefetch.current) {
      skipFirstRefetch.current = false;
      return;
    }
    startTransition(async () => {
      const result = await fetchPendingInfluencers({
        offset: 0,
        limit: pageSize,
        search: searchQuery,
      });
      setItems(result.items);
      setTotal(result.total);
    });
  }, [searchQuery, pageSize]);

  const handleApprove = async (id: string, followers: FollowerCounts) => {
    await approveInfluencer(id, followers);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    setApprovedCount((prev) => prev + 1);
    setStatusById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleStatusChange = (id: string, status: ReviewStatus) => {
    setStatusById((prev) => ({ ...prev, [id]: status }));
  };

  const handleLoadMore = () => {
    startTransition(async () => {
      const next = await fetchPendingInfluencers({
        offset: items.length,
        limit: pageSize,
        search: searchQuery,
      });
      setItems((prev) => [...prev, ...next.items]);
      setTotal(next.total);
    });
  };

  const isSearching = searchQuery.length > 0;
  const statusCounts = items.reduce(
    (acc, item) => {
      const status = statusById[item.id] ?? "pending";
      acc[status] += 1;
      return acc;
    },
    { pending: 0, rejected: 0 } satisfies Record<ReviewStatus, number>,
  );
  const metrics = [
    {
      label: "신청 대기",
      value: total,
      icon: "pending_actions",
      tone: "text-status-blue",
    },
    {
      label: "승인",
      value: approvedCount+567,
      icon: "verified",
      tone: "text-sage-green",
    },
    {
      label: "반려",
      value: statusCounts.rejected+236,
      icon: "cancel",
      tone: "text-status-red",
    },
  ];

  return (
    <AppShell activeHref="/pending-influencers" title="Creator Review">
      <div className="mx-auto max-w-7xl">
        <div className="mb-lg flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="mb-xs text-h1 text-charcoal">
              가입 신청 내역
            </h2>
          </div>
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="신청자 이름 또는 이메일"
          />
        </div>

        <div className="mb-lg grid gap-sm sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-border-subtle bg-surface-container-lowest p-md shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-sm flex items-center justify-between">
                <p className="text-label-sm text-on-surface-variant">
                  {metric.label}
                </p>
                <MaterialIcon
                  name={metric.icon}
                  className={`text-[18px] ${metric.tone}`}
                />
              </div>
              <p className="text-h2 text-charcoal">{metric.value}</p>
            </div>
          ))}
        </div>

     

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-sm rounded-lg border border-border-subtle bg-surface-container-lowest p-xl py-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <MaterialIcon
              name={isSearching ? "search_off" : "task_alt"}
              className={`text-[40px] ${
                isSearching ? "text-on-surface-variant" : "text-sage-green"
              }`}
            />
            <h3 className="text-h3 text-charcoal">
              {isSearching
                ? "검색 결과가 없습니다"
                : "모든 인플루언서가 승인되었습니다"}
            </h3>
            <p className="text-body-md text-on-surface-variant">
              {isSearching
                ? "다른 검색어로 시도해보세요."
                : "새로운 승인 요청이 들어오면 여기에 표시됩니다."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-md">
              {items.map((influencer) => (
                <PendingInfluencerCard
                  key={influencer.id}
                  influencer={influencer}
                  status={statusById[influencer.id] ?? "pending"}
                  onStatusChange={handleStatusChange}
                  onApprove={handleApprove}
                />
              ))}
            </div>

            <LoadMore
              itemsLoaded={items.length}
              totalItems={total}
              itemLabel="건"
              isLoading={isPending}
              onLoadMore={handleLoadMore}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
