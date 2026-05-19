"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import AppShell from "@/components/AppShell";
import LoadMore from "@/components/LoadMore";
import MaterialIcon from "@/components/MaterialIcon";
import SearchBar from "@/components/SearchBar";
import { fetchApprovedBusinesses, revokeBusinessApproval } from "@/app/actions/businesses";
import type { Business } from "@/types/business";
import ApprovedBusinessCard from "./ApprovedBusinessCard";

type Props = {
  initialItems: Business[];
  initialTotal: number;
  pageSize: number;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function ApprovedBusinessesView({ initialItems, initialTotal, pageSize }: Props) {
  const [items, setItems] = useState<Business[]>(initialItems);
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
      const result = await fetchApprovedBusinesses({
        offset: 0,
        limit: pageSize,
        search: searchQuery,
      });
      setItems(result.items);
      setTotal(result.total);
    });
  }, [searchQuery, pageSize]);

  const handleRevoke = async (id: string) => {
    await revokeBusinessApproval(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  const handleLoadMore = () => {
    startTransition(async () => {
      const next = await fetchApprovedBusinesses({
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
    <AppShell activeHref="/verified-businesses" title="Approved">
      <div className="mx-auto max-w-6xl">
        <div className="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-h1 mb-xs text-charcoal">승인 완료 사업자</h2>
            <p className="text-body-md text-on-surface-variant">
              {isSearching
                ? `검색 결과 ${total}개`
                : `총 ${total}개의 사업자가 시스템에 등록되어 관리 중입니다.`}
            </p>
          </div>
          <SearchBar value={searchInput} onChange={setSearchInput} />
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-sm rounded-xl border border-border-subtle bg-surface-container-lowest p-xl py-16 text-center">
            <MaterialIcon
              name={isSearching ? "search_off" : "inbox"}
              className="text-[40px] text-on-surface-variant"
            />
            <h3 className="text-h3 text-charcoal">
              {isSearching ? "검색 결과가 없습니다" : "승인된 사업자가 없습니다"}
            </h3>
            <p className="text-body-md text-on-surface-variant">
              {isSearching
                ? "다른 검색어로 시도해보세요."
                : "Pending Approval 페이지에서 승인하면 여기에 표시됩니다."}
            </p>
          </div>
        ) : (
          <>
            <div className="gap-lg grid grid-cols-1 lg:grid-cols-2">
              {items.map((business) => (
                <ApprovedBusinessCard
                  key={business.id}
                  business={business}
                  onRevoke={handleRevoke}
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
