"use client";

import { useState } from "react";
import SideNav from "./SideNav";
import TopAppBar from "./TopAppBar";

type AppShellProps = {
  activeHref: string;
  title: string;
  children: React.ReactNode;
};

export default function AppShell({
  activeHref,
  title,
  children,
}: AppShellProps) {
  const [sideNavOpen, setSideNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-canvas">
      <SideNav
        activeHref={activeHref}
        isOpen={sideNavOpen}
        onClose={() => setSideNavOpen(false)}
      />
      <TopAppBar title={title} onMenuClick={() => setSideNavOpen(true)} />
      <main className="p-md md:ml-sidebar-width md:p-xl">{children}</main>
    </div>
  );
}
