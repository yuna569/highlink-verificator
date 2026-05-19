"use client";

import { useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import type { Business } from "@/types/business";

type Props = {
  business: Business;
  onRevoke?: (id: string) => void | Promise<void>;
};

export default function ApprovedBusinessCard({ business, onRevoke }: Props) {
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await onRevoke?.(business.id);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="group relative rounded-xl border border-border-subtle bg-surface-container-lowest p-lg transition-all">
      <div className="text-label-sm absolute right-lg top-lg rounded border border-sage-green/30 bg-sage-green/5 px-sm py-xs uppercase tracking-wider text-sage-green">
        Approved
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

      <div className="mt-md flex justify-end">
        <button
          type="button"
          onClick={handleRevoke}
          disabled={isRevoking}
          className="text-label-sm flex items-center gap-1 rounded border border-status-red/30 px-md py-1.5 text-status-red transition-all hover:bg-status-red/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MaterialIcon name="undo" className="text-[16px]" />
          {isRevoking ? "취소 중..." : "승인 취소"}
        </button>
      </div>
    </div>
  );
}
