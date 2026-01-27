"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Insights",
      url: "/insights",  // Changed from "#"
      icon: IconChartBar,
      isActive: true,
    },
    {
      title: "Subscriptions",
      url: "/subscriptions",  // Changed from "#"
      icon: IconListDetails,
    },
    {
      title: "Licences",
      url: "/licences",  // Changed from "#"
      icon: IconReport,
    },
    {
      title: "Users",
      url: "/users",  // Changed from "#"
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",  // Changed from "#"
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",  // Changed from "#"
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",  // Keep as # for search modal
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "/data-library",  // Changed from "#"
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "/reports",  // Changed from "#"
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "/word-assistant",  // Changed from "#"
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/insights">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Kroeva</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}