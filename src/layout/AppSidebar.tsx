"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  HorizontaLDots,
  ListIcon,
} from "../icons/index";

import {
  AlbumIcon, AlignHorizontalJustifyStart, Clock10Icon, FolderGit2, GraduationCapIcon, Handshake, HeartPulseIcon, MessageSquareMore,
  CalendarPlus,
  Lightbulb,
  FileUp,
  MessageSquareMoreIcon,
  User,
  NotebookPen
} from "lucide-react"

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <AlignHorizontalJustifyStart strokeWidth={1.5} />,
    name: "Analytics",
    path: "/"
  },
  {
    icon: <Clock10Icon strokeWidth={1.5} />,
    name: "Check-in",
    path: "/clock",
  },
  {
    icon: <FolderGit2 strokeWidth={1.5} />,
    name: "Projects",
    path: "/project",
  },
  
  {
    name: "Kanban Board",
    icon: <ListIcon />,
    path: "/kanban",
    // subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Well Being",
    icon: <HeartPulseIcon strokeWidth={1.5} />,
    path: "/well-being",
    // subItems: [
      //   { name: "Blank Page", path: "/blank", pro: false },
      //   { name: "404 Error", path: "/error-404", pro: false },
      // ],
    },
    {
      icon: <CalendarPlus strokeWidth={1.5} />,
      name: "Meetings",
      path: "/meeting",
    },
];

const othersItems: NavItem[] = [
  {
    icon: <AlbumIcon strokeWidth={1.5} />,
    name: "Leave Requests",
    path: "/leave-requests",
    // subItems: [
    //   { name: "Sign In", path: "/signin", pro: false },
    //   { name: "Sign Up", path: "/signup", pro: false },
    // ],
  },
  {
    icon: <Handshake strokeWidth={1.5} />,
    name: "Feedbacks",
    path: "/feedbacks",
    // subItems: [
    //   { name: "Alerts", path: "/alerts", pro: false },
    //   { name: "Avatar", path: "/avatars", pro: false },
    //   { name: "Badge", path: "/badge", pro: false },
    //   { name: "Buttons", path: "/buttons", pro: false },
    //   { name: "Images", path: "/images", pro: false },
    //   { name: "Videos", path: "/videos", pro: false },
    // ],
  },
  {
    icon: <GraduationCapIcon strokeWidth={1.5} />,
    name: "Certifications",
    path: "/certificates"
    // subItems: [
    //   { name: "Line Chart", path: "/line-chart", pro: false },
    //   { name: "Bar Chart", path: "/bar-chart", pro: false },
    // ],
  },
];

const clientItems: NavItem[] = [
  {
    icon: <CalendarPlus strokeWidth={1.5} />,
    name: "Meetings",
    path: "/client-meetings",
  },
  {
    icon: <Lightbulb strokeWidth={1.5} />,
    name: "Features",
    path: "/client-features",
  },
  {
    icon: <FileUp strokeWidth={1.5} />,
    name: "Documents",
    path: "/client-documents",
  },
  {
    icon: <MessageSquareMore strokeWidth={1.5} />,
    name: "Feedbacks",
    path: "/client-feedback",
  },
];

const adminOnlyItem: NavItem[] = [
  {
    name: "User Management",
    icon: <User strokeWidth={1.5} />,
    path: "/user",
  },
  {
    name: "Leave Management",
    icon: <NotebookPen strokeWidth={1.5} />,
    path: "/leavemanage",
  }
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others" | "for client" | "for Admin"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others" | "for client" | "for Admin";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others", "for client"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others" | "for client" | "for Admin",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others" | "for client" | "for Admin") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex justify-center items-center gap-2.5">
              <Image
                src="/images/logo/logo.jpg"
                className="rounded-lg"
                alt="Logo"
                width={40}
                height={40}
              />
              <h1 className="text-2xl text-black dark:text-white">Arinova Studio</h1>
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
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* MAIN MENU */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* OTHERS MENU */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>

            {/* CLIENT SECTION */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "For Clients"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>

              {renderMenuItems(clientItems, "for client")}
            </div>
{/* admin */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "For Admin"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>

              {renderMenuItems(adminOnlyItem, "for Admin")}
            </div>
          </div>
        </nav>

      </div>
    </aside>
  );
};

export default AppSidebar;
