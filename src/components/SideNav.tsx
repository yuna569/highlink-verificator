"use client";

import Image from "next/image";
import Link from "next/link";
import MaterialIcon from "./MaterialIcon";
import { logout } from "@/app/actions/auth";

type NavItem = {
  href: string;
  icon: string;
  label: string;
  description: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/pending-influencers",
    icon: "pending_actions",
    label: "승인 큐",
    description: "가입 신청 리뷰",
  },
  {
    href: "/verified-influencers",
    icon: "verified_user",
    label: "승인 완료",
    description: "등록 크리에이터",
  },
];

type SideNavProps = {
  activeHref: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export default function SideNav({ activeHref, isOpen, onClose }: SideNavProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-sidebar-width flex-col border-r border-border-subtle bg-surface-container-lowest px-md py-lg transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="mb-xl px-sm">
          <div className="mb-md flex items-center gap-sm">
            <Image
              src="/highlink_black.png"
              alt="Highlink"
              width={126}
              height={34}
              className="h-8 w-auto object-contain"
              priority
              unoptimized
            />
          </div>
          <p className="text-label-sm text-on-surface-variant">
            Creator Review Console
          </p>
        </div>
        <nav className="flex-1 space-y-base">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === activeHref;
            const baseClasses =
              "flex items-center gap-sm rounded-lg px-md py-sm transition-all";
            const stateClasses = isActive
              ? "bg-surface-container-low text-primary"
              : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`${baseClasses} ${stateClasses}`}
              >
                <MaterialIcon
                  name={item.icon}
                  className={isActive ? "text-charcoal" : ""}
                />
                <span className="min-w-0">
                  <span className="block text-label-md">{item.label}</span>
                  <span className="block truncate text-label-sm text-on-surface-variant">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-sm rounded-lg px-md py-sm text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-status-red"
          >
            <MaterialIcon name="logout" />
            <span className="text-body-md">로그아웃</span>
          </button>
        </form>
      </aside>
    </>
  );
}
