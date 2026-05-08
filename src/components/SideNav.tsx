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
};

export default function SideNav({ activeHref }: SideNavProps) {
  return (
    <aside className="w-sidebar-width fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border-subtle bg-surface-canvas px-md py-lg">
      <div className="mb-xl px-sm">
        <h1 className="text-h2 font-semibold text-charcoal">Verifier Admin</h1>
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
              className={`${baseClasses} ${stateClasses}`}
            >
              <MaterialIcon name={item.icon} />
              <span className="text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
