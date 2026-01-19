"use client";

import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import Image from "next/image";
import React, {  useCallback } from "react";
import { usePathname } from "next/navigation";

import { 
  LayoutDashboard, 
  MessageSquare, 
  CalendarClock, 
  Sparkles,
  FileText 
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const clientNavItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard strokeWidth={1.5} />,
    path: "/client",
  },
  {
    name: "Feedbacks",
    icon: <MessageSquare strokeWidth={1.5} />,
    path: "/client/feedbacks",
  },
  {
    name: "Schedule Meet",
    icon: <CalendarClock strokeWidth={1.5} />,
    path: "/client/schedule-meet",
  },
  {
    name: "Feature Requests",
    icon: <Sparkles strokeWidth={1.5} />,
    path: "/client/feature-requests",
  },
  {
    name: "Project Documents",
    icon: <FileText strokeWidth={1.5} />,
    path: "/client/documents",
  },
  {
    name: "Analytics",
    icon: <LayoutDashboard strokeWidth={1.5} />,
    path: "/client/analytics",
  }
];

const ClientSidebar = () => {
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`
        fixed  flex flex-col top-0 px-5 left-0 bg-white 
        dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen 
        border-r border-gray-200 transition-all duration-300 
        ease-in-out z-50
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/client">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo/logo.jpg"
                className="rounded-lg"
                alt="Logo"
                width={40}
                height={40}
              />
              <h1 className="text-xl text-black dark:text-white font-semibold">
                Arinova Studio
              </h1>
            </div>
          ) : (
            <Image
              src="/images/logo/logo.jpg"
              className="rounded-lg"
              alt="Logo"
              width={40}
              height={40}
            />
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-6 overflow-y-auto no-scrollbar">
        <h2
          className={`mb-3 text-xs uppercase text-gray-400 ${
            !isExpanded && !isHovered ? "lg:text-center" : ""
          }`}
        >
          Menu
        </h2>

        <ul className="flex flex-col gap-4">
          {clientNavItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`menu-item group ${
                  isActive(item.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(item.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {item.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default ClientSidebar;
