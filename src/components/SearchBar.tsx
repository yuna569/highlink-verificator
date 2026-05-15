"use client";

import MaterialIcon from "./MaterialIcon";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "이름 또는 이메일 검색",
}: SearchBarProps) {
  return (
    <div className="relative w-full md:w-80">
      <span className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
        <MaterialIcon name="search" className="text-[18px]" />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-body-md h-10 w-full rounded-lg border border-border-subtle bg-surface-container-lowest py-1.5 pl-9 pr-md text-charcoal transition-all placeholder:text-on-surface-variant focus:border-charcoal focus:outline-none focus:ring-0"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-charcoal"
        >
          <MaterialIcon name="close" className="text-[16px]" />
        </button>
      )}
    </div>
  );
}
