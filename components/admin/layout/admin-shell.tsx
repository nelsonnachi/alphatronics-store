"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";


type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <AdminSidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-7">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}