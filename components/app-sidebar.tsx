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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

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
    title: "Payouts",
    url: "/admin/payouts",
    icon: IconCreditCard,
    children: [
      { title: "Pending", url: "/admin/payouts/pending" },
      { title: "Completed", url: "/admin/payouts/completed" },
    ],
  },
];

function NavItem({
  item,
  pathname,
}: {
  item: (typeof navItems)[number];
  pathname: string;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
  const [open, setOpen] = React.useState(isActive);

  // For items without children, render a Link
  if (!hasChildren) {
    return (
      <li className="list-none">
        <Link
          href={item.url}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors",
            isActive
              ? "text-[#F97316] font-medium border-l-2 border-[#F97316] bg-[#F97316]/5"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          {item.icon && (
            <item.icon
              className={cn("size-4 shrink-0", isActive && "text-[#F97316]")}
            />
          )}
          <span className="flex-1 text-left">{item.title}</span>
        </Link>
      </li>
    );
  }

  // For items with children, render button for dropdown + links for children
  return (
    <li className="list-none">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors",
          isActive
            ? "text-[#F97316] font-medium border-l-2 border-[#F97316] bg-[#F97316]/5"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        {item.icon && (
          <item.icon
            className={cn("size-4 shrink-0", isActive && "text-[#F97316]")}
          />
        )}
        <span className="flex-1 text-left">{item.title}</span>
        {open ? (
          <IconChevronDown className="size-3.5 opacity-60" />
        ) : (
          <IconChevronRight className="size-3.5 opacity-60" />
        )}
      </button>

      {open && (
        <ul className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
          {item.children!.map((child) => {
            const childActive = pathname === child.url;
            return (
              <li key={child.title}>
                <Link
                  href={child.url}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    childActive
                      ? "text-[#F97316] font-medium"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                  )}
                >
                  {child.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Logo */}
      <SidebarHeader className="px-4 py-4 lg:py-4 border-b ">
        <Link href="/admin/dashboard" className="flex items-center gap-1">
          <img src="/logo.png" alt="Logo" className="h-8" />
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 py-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.title} item={item} pathname={pathname} />
          ))}
        </ul>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 pb-4">
        <SidebarSeparator className="mb-3" />
       <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors",
            pathname === "/admin/settings" // Fix this line - use pathname directly instead of isActive
              ? "text-[#F97316] font-medium border-l-2 border-[#F97316] bg-[#F97316]/5"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <IconSettings className="size-4 shrink-0" />
          <span>Settings</span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
