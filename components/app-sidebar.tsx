"use client";

import * as React from "react";
import {
  IconShoppingBag,
  IconCreditCard,
  IconSettings,
  IconChevronDown,
  IconChevronRight,
  IconLayout,
  IconUser,
  IconChevronUp,
  IconCirclesRelation,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─── Nav data ─────────────────────────────────────────────────────────────────

const navItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: IconLayout,
  },
  {
    title: "User Management",
    url: "/admin/user-management",
    icon: IconUser,
    children: [
      { title: "Staff", url: "/admin/user-management/staff" },
      { title: "Vendors", url: "/admin/user-management/vendors" },
      { title: "Marketers", url: "/admin/user-management/marketers" },
    ],
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: IconShoppingBag,
  },
  {
    title: "Campaigns",
    url: "/admin/campaigns",
    icon: IconCirclesRelation,
  },
  {
    title: "Payouts",
    url: "/admin/payouts",
    icon: IconCreditCard,
    children: [
      { title: "Pending", url: "/admin/payouts/pending" },
      { title: "Completed", url: "/admin/payouts/completed" },
    ],
  },
];

const footerNavItems = [
  {
    title: "Settings",
    url: "/admin/settings",
    icon: IconSettings,
  },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────

type NavItemDef = (typeof navItems)[number];

function NavItem({ item, pathname }: { item: NavItemDef; pathname: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const hasChildren = Boolean(item.children?.length);
  const isActive =
    pathname === item.url || pathname.startsWith(item.url + "/");
  const [open, setOpen] = React.useState(isActive);

  // ── Collapsed state ──────────────────────────────────────────────────────

  if (collapsed) {
    // No children → just an icon with a tooltip
    if (!hasChildren) {
      return (
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={cn(
                  // center the icon when collapsed
                  "flex items-center justify-center",
                  isActive && "text-[#F97316] bg-[#F97316]/5",
                )}
              >
                <Link href={item.url}>
                  <item.icon className="size-4 shrink-0" />
                  <span className="sr-only">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {item.title}
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    }

    // Has children → icon with a tooltip AND a popover that shows sub-items
    return (
      <SidebarMenuItem>
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <SidebarMenuButton
                  isActive={isActive}
                  className={cn(
                    "flex items-center justify-center",
                    isActive && "text-[#F97316] bg-[#F97316]/5",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="sr-only">{item.title}</span>
                </SidebarMenuButton>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {item.title}
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-44 p-1.5"
          >
            {/* Popover header */}
            <p className="mb-1 px-2 py-1 text-xs font-semibold text-muted-foreground">
              {item.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {item.children!.map((child) => {
                const childActive = pathname === child.url;
                return (
                  <Link
                    key={child.url}
                    href={child.url}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-sm transition-colors",
                      childActive
                        ? "bg-[#F97316]/10 text-[#F97316] font-medium"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {child.title}
                  </Link>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    );
  }

  // ── Expanded state ───────────────────────────────────────────────────────

  // No children
  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            "rounded-none min-h-11",
            isActive &&
              "text-[#F97316] font-medium border-l-3 border-[#F97316] bg-[#F97316]/5",
          )}
        >
          <Link href={item.url}>
            <item.icon className={cn("size-4 shrink-0", isActive && "text-[#F97316]")} />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Has children — collapsible section
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "rounded-none min-h-11",
          isActive &&
            "text-[#F97316] font-medium bg-[#F97316]/5",
        )}
      >
        {/* <item.icon className={cn("size-4 shrink-0", isActive && "text-[#F97316]")} /> */}
        <item.icon className={cn("size-4 shrink-0")} />
        <span className="flex-1 text-left">{item.title}</span>
        {open ? (
          <IconChevronUp className="size-3.5 opacity-60" />
        ) : (
          <IconChevronDown className="size-3.5 opacity-60" />
        )}
      </SidebarMenuButton>

      {open && (
        <SidebarMenuSub>
          {item.children!.map((child) => {
            const childActive = pathname === child.url;
            return (
              <SidebarMenuSubItem key={child.url}>
                <SidebarMenuSubButton asChild isActive={childActive} className={cn(childActive && "text-[#F97316]! font-medium rounded-none border-l-3 border-[#F97316]")}>
                  <Link
                    href={child.url}
                    className={cn(childActive && "text-[#F97316] font-medium")}
                  >
                    {child.title}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props} className="bg-[#FFFFFF]!">
      {/* Logo */}
      <SidebarHeader
        className={cn(
          "border-b transition-all bg",
          collapsed ? "px-0 py-4 items-center" : "px-4 py-4",
        )}
      >
        {collapsed ? (
          // Show a small monogram/icon when collapsed so the header isn't empty
          <div className="flex w-full items-center justify-center">
            <img src="/Mono_dark.svg" alt="Logo" className="h-8 w-6 object-contain" />
          </div>
        ) : (
          <Link href="/admin/dashboard" className="flex items-center gap-1">
            <img src="/Mono_dark.svg" alt="Logo" className="h-8" />
          </Link>
        )}
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="w-full overflow-hidden px-0 py-2">
        <SidebarMenu className="w-full gap-0.5 overflow-hidden px-0">
          {navItems.map((item) => (
            <NavItem key={item.title} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="w-full overflow-hidden px-0 pb-4">
        <SidebarSeparator className="mb-2 mx-0!" />
        <SidebarMenu className="w-full gap-0.5 overflow-hidden px-0">
          {footerNavItems.map((item) => (
            <NavItem key={item.title} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}