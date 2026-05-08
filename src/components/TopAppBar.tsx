"use client";

import { useState } from "react";
import MaterialIcon from "./MaterialIcon";

type TopAppBarProps = {
  title: string;
  profileImageUrl?: string;
};

export default function TopAppBar({ title, profileImageUrl }: TopAppBarProps) {
  const [query, setQuery] = useState("");

  return (
    <header className="ml-sidebar-width sticky top-0 z-40 flex w-[calc(100%-var(--spacing-sidebar-width))] items-center justify-between border-b border-border-subtle bg-surface-canvas px-xl py-md">
      <div className="flex items-center gap-lg">
        <h2 className="text-h2 font-black text-charcoal">{title}</h2>
        <div className="relative w-64">
          <span className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
            <MaterialIcon name="search" className="text-[18px]" />
          </span>
          <input
            type="text"
            placeholder="Search influencers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-body-md w-full rounded-lg border border-border-subtle bg-surface-container-lowest py-1.5 pl-9 pr-md transition-all focus:border-charcoal focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      <div className="flex items-center gap-md">
        <button
          type="button"
          aria-label="Notifications"
          className="text-on-surface-variant transition-opacity hover:text-charcoal"
        >
          <MaterialIcon name="notifications" />
        </button>
        <button
          type="button"
          aria-label="Settings"
          className="text-on-surface-variant transition-opacity hover:text-charcoal"
        >
          <MaterialIcon name="settings" />
        </button>
        <div className="mx-sm h-6 w-px bg-border-subtle" />
        {profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profileImageUrl}
            alt="Administrator Profile"
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-surface-container-high" />
        )}
      </div>
    </header>
  );
}
