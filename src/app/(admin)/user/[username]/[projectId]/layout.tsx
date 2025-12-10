"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";
import ClientSidebar from "@/layout/ClientSidebar";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <ClientSidebar />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out `}
      >
        {/* Page Content */}
        <div className=" max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
