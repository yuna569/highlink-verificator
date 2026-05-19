"use client";

import { useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import type { PendingBusiness } from "@/types/business";

type Props = {
  business: PendingBusiness;
  onApprove?: (id: string) => void | Promise<void>;
};

export default function PendingBusinessCard({ business, onApprove }: Props) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove?.(business.id);
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
        <div className="space-y-xs">
          <h3 className="text-h3 text-charcoal">{business.email}</h3>
          {business.category && (
            <p className="text-body-md text-on-surface-variant">카테고리: {business.category}</p>
          )}
          {business.budgetRange && (
            <p className="text-body-md text-on-surface-variant">예산: {business.budgetRange}</p>
          )}
          {business.promotionTarget && (
            <p className="text-body-md text-on-surface-variant">홍보 대상: {business.promotionTarget}</p>
          )}
          <p className="text-label-sm text-on-surface-variant">ID: {business.id}</p>
        </div>
      </div>

      <div className="mt-md flex flex-col gap-sm md:flex-row md:items-center md:justify-end">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isApproving}
          className="text-label-sm flex items-center gap-1 rounded bg-sage-green px-md py-1.5 text-white transition-all disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-on-surface-variant"
        >
          <MaterialIcon name="check" className="text-[16px]" />
          {isApproving ? "승인 중..." : "승인하기"}
        </button>
      </div>
    </div>
  );
}
