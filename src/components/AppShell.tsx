"use client";

import { useState } from "react";
import SideNav from "./SideNav";


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
      <main className="px-md py-lg md:ml-sidebar-width md:px-xl md:py-lg">
        {children}
      </main>
    </div>
  );
}
