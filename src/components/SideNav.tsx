"use client";

import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/pending-influencers",
    icon: "pending_actions",
    label: "Pending Approval",
  },
  { href: "/verified-influencers", icon: "verified_user", label: "Approved" },
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-sidebar-width flex-col border-r border-border-subtle bg-surface-canvas px-md py-lg transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="mb-xl px-sm">
          <h1 className="text-h2 font-semibold text-charcoal">
            Verifier Admin
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Influencer Dashboard
          </p>
        </div>
        <nav className="flex-1 space-y-base">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === activeHref;
            const baseClasses =
              "flex items-center gap-sm rounded px-md py-sm transition-all";
            const stateClasses = isActive
              ? "bg-surface-container-lowest text-primary font-bold border-r-2 border-primary"
              : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`${baseClasses} ${stateClasses}`}
              >
                <MaterialIcon name={item.icon} />
                <span className="text-body-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
