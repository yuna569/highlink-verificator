"use client";

import MaterialIcon from "./MaterialIcon";

type LoadMoreProps = {
  itemsLoaded: number;
  totalItems: number;
  itemLabel?: string;
  isLoading?: boolean;
  onLoadMore: () => void;
};

export default function LoadMore({
  itemsLoaded,
  totalItems,
  itemLabel = "명",
  isLoading = false,
  onLoadMore,
}: LoadMoreProps) {
  const allLoaded = itemsLoaded >= totalItems;

  return (
    <div className="mt-xl flex flex-col items-center gap-sm border-t border-border-subtle pt-lg">
      <p className="text-body-md text-on-surface-variant">
        {totalItems}
        {itemLabel} 중 {itemsLoaded}
        {itemLabel} 표시
      </p>
      {allLoaded ? (
        <p className="text-label-sm text-on-surface-variant">
          모두 불러왔습니다
        </p>
      ) : (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoading}
          className="text-label-md flex items-center gap-xs rounded-lg border border-border-subtle bg-surface-container-lowest px-lg py-sm transition-all hover:border-charcoal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <MaterialIcon
                name="progress_activity"
                className="animate-spin text-[18px]"
              />
              불러오는 중...
            </>
          ) : (
            <>
              <MaterialIcon name="expand_more" className="text-[18px]" />
              더 보기
            </>
          )}
        </button>
      )}
    </div>
  );
}
