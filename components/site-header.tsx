"use client"

import { IconBell, IconMoon, IconSun, IconUser } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SiteHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-[--header-height] shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 py-4 lg:px-6 lg:py-3.5">
        {/* Sidebar toggle — orange circle chevron matching design */}
        <div className="flex items-center">
          <SidebarTrigger className="-ml-10 size-8 rounded-full bg-[#F97316] text-white hover:bg-[#F97316]/90 hover:text-white [&_svg]:size-4" />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-muted-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <IconSun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <IconMoon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 rounded-full text-muted-foreground"
          >
            <IconBell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#F97316]" />
          </Button>

          <Separator orientation="vertical" className="h-5" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full px-2 py-1 h-auto"
              >
                <Avatar className="size-7">
                  <AvatarImage src="/avatars/user.jpg" alt="John Smith" />
                  <AvatarFallback className="bg-muted text-xs">JS</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  John Smith
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}