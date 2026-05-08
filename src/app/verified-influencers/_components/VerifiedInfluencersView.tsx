"use client";

import { useState, useTransition } from "react";
import SideNav from "@/components/SideNav";
import TopAppBar from "@/components/TopAppBar";
import LoadMore from "@/components/LoadMore";
import MaterialIcon from "@/components/MaterialIcon";
import {
  fetchVerifiedInfluencers,
  revokeApproval,
  saveFollowerCounts,
} from "@/app/actions/influencers";
import type {
  FollowerCounts,
  Influencer,
} from "@/types/influencer";
import InfluencerCard from "./InfluencerCard";

type VerifiedInfluencersViewProps = {
  initialItems: Influencer[];
  initialTotal: number;
  pageSize: number;
};

export default function VerifiedInfluencersView({
  initialItems,
  initialTotal,
  pageSize,
}: VerifiedInfluencersViewProps) {
  const [items, setItems] = useState<Influencer[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();

  const handleSave = async (id: string, socials: FollowerCounts) => {
    await saveFollowerCounts(id, socials);
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, socials: { ...i.socials, ...socials } } : i,
      ),
    );
  };

  const handleRevoke = async (id: string) => {
    await revokeApproval(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  const handleLoadMore = () => {
    startTransition(async () => {
      const next = await fetchVerifiedInfluencers({
        offset: items.length,
        limit: pageSize,
      });
      setItems((prev) => [...prev, ...next.items]);
      setTotal(next.total);
    });
  };

  return (
    <div className="min-h-screen bg-surface-canvas">
      <SideNav activeHref="/verified-influencers" />
      <TopAppBar title="Follower Verification" />

      <main className="ml-sidebar-width p-xl">
        <div className="mx-auto max-w-6xl">
          <div className="mb-xl flex items-end justify-between">
            <div>
              <h2 className="text-h1 mb-xs text-charcoal">
                승인 완료 인플루언서
              </h2>
              <p className="text-body-md text-on-surface-variant">
                총 {total}명의 인플루언서가 시스템에 등록되어 관리 중입니다.
              </p>
            </div>
            <div className="flex gap-sm">
              <button
                type="button"
                className="text-label-md flex items-center gap-xs rounded-lg border border-border-subtle bg-surface-container-lowest px-md py-sm transition-all hover:border-charcoal"
              >
                <MaterialIcon name="filter_list" className="text-[18px]" />
                필터
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-sm rounded-xl border border-border-subtle bg-surface-container-lowest p-xl py-16 text-center">
              <MaterialIcon
                name="inbox"
                className="text-[40px] text-on-surface-variant"
              />
              <h3 className="text-h3 text-charcoal">
                승인된 인플루언서가 없습니다
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Pending Approval 페이지에서 승인하면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <>
              <div className="gap-lg grid grid-cols-1 lg:grid-cols-2">
                {items.map((influencer) => (
                  <InfluencerCard
                    key={influencer.id}
                    influencer={influencer}
                    onSave={handleSave}
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
      </main>
    </div>
  );
}
