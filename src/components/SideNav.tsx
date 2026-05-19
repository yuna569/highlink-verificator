"use client";

import Link from "next/link";
import MaterialIcon from "./MaterialIcon";
import { logout } from "@/app/actions/auth";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Influencer",
    items: [
      { href: "/pending-influencers", icon: "pending_actions", label: "Pending Approval" },
      { href: "/verified-influencers", icon: "verified_user", label: "Approved" },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/pending-businesses", icon: "pending_actions", label: "Pending Approval" },
      { href: "/verified-businesses", icon: "verified_user", label: "Approved" },
    ],
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
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-sidebar-width flex-col border-r border-border-subtle bg-surface-canvas px-md py-lg transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="mb-xl px-sm">
          <h1 className="text-h2 font-semibold text-charcoal">
            Verifier Admin
          </h1>
        </div>

        <nav className="flex-1 space-y-lg">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-label-sm mb-xs px-md uppercase tracking-wider text-on-surface-variant">
                {section.title}
              </p>
              <div className="space-y-base">
                {section.items.map((item) => {
                  const isActive = item.href === activeHref;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-sm rounded px-md py-sm transition-all ${
                        isActive
                          ? "bg-surface-container-lowest text-primary font-bold border-r-2 border-primary"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                      }`}
                    >
                      <MaterialIcon name={item.icon} />
                      <span className="text-body-md">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-sm rounded px-md py-sm text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-status-red"
          >
            <MaterialIcon name="logout" />
            <span className="text-body-md">로그아웃</span>
          </button>
        </form>
      </aside>
    </>
  );
}
