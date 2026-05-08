"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import SideNav from "@/components/SideNav";
import TopAppBar from "@/components/TopAppBar";
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
import PendingInfluencerCard from "./PendingInfluencerCard";

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

  return (
    <div className="min-h-screen bg-surface-canvas">
      <SideNav activeHref="/pending-influencers" />
      <TopAppBar title="Pending Approval" />

      <main className="ml-sidebar-width p-xl">
        <div className="mx-auto max-w-6xl">
          <div className="mb-xl flex items-end justify-between">
            <div>
              <h2 className="text-h1 mb-xs text-charcoal">
                승인 대기 인플루언서
              </h2>
              <p className="text-body-md text-on-surface-variant">
                {isSearching
                  ? `검색 결과 ${total}명`
                  : `총 ${total}명의 인플루언서가 승인을 기다리고 있습니다. 오래된 순으로 정렬됩니다.`}
              </p>
            </div>
            <SearchBar value={searchInput} onChange={setSearchInput} />
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-sm rounded-xl border border-border-subtle bg-surface-container-lowest p-xl py-16 text-center">
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
              <div className="gap-lg grid grid-cols-1 lg:grid-cols-2">
                {items.map((influencer) => (
                  <PendingInfluencerCard
                    key={influencer.id}
                    influencer={influencer}
                    onApprove={handleApprove}
                  />
                ))}
              </div>

              <LoadMore
                itemsLoaded={items.length}
                totalItems={total}
                isLoading={isPending}
                onLoadMore={handleLoadMore}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
