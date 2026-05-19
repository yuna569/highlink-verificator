"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import AppShell from "@/components/AppShell";
import LoadMore from "@/components/LoadMore";
import MaterialIcon from "@/components/MaterialIcon";
import SearchBar from "@/components/SearchBar";
import { approveBusiness, fetchPendingBusinesses } from "@/app/actions/businesses";
import type { PendingBusiness } from "@/types/business";
import PendingBusinessCard from "./PendingBusinessCard";

type Props = {
  initialItems: PendingBusiness[];
  initialTotal: number;
  pageSize: number;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function PendingBusinessesView({ initialItems, initialTotal, pageSize }: Props) {
  const [items, setItems] = useState<PendingBusiness[]>(initialItems);
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
      const result = await fetchPendingBusinesses({
        offset: 0,
        limit: pageSize,
        search: searchQuery,
      });
      setItems(result.items);
      setTotal(result.total);
    });
  }, [searchQuery, pageSize]);

  const handleApprove = async (id: string) => {
    await approveBusiness(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  const handleLoadMore = () => {
    startTransition(async () => {
      const next = await fetchPendingBusinesses({
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
    <AppShell activeHref="/pending-businesses" title="Pending Approval">
      <div className="mx-auto max-w-6xl">
        <div className="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-h1 mb-xs text-charcoal">승인 대기 사업자</h2>
            <p className="text-body-md text-on-surface-variant">
              {isSearching
                ? `검색 결과 ${total}개`
                : `총 ${total}개의 사업자가 승인을 기다리고 있습니다. 오래된 순으로 정렬됩니다.`}
            </p>
          </div>
          <SearchBar value={searchInput} onChange={setSearchInput} />
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-sm rounded-xl border border-border-subtle bg-surface-container-lowest p-xl py-16 text-center">
            <MaterialIcon
              name={isSearching ? "search_off" : "task_alt"}
              className={`text-[40px] ${isSearching ? "text-on-surface-variant" : "text-sage-green"}`}
            />
            <h3 className="text-h3 text-charcoal">
              {isSearching ? "검색 결과가 없습니다" : "모든 사업자가 승인되었습니다"}
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
              {items.map((business) => (
                <PendingBusinessCard
                  key={business.id}
                  business={business}
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
    </AppShell>
  );
}
