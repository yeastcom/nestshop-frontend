"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconAddressBook,
  IconUsers,
  IconBrandProducthunt,
  IconFileText,
  IconMenu
} from "@tabler/icons-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Produkty",
      url: "/admin/product",
      icon: IconBrandProducthunt,
    },
    {
      title: "Kategorie",
      url: "/admin/category",
      icon: IconFolder,
    },
    {
      title: "Zamówienia",
      url: "/admin/order",
      icon: IconChartBar,
    },
    {
      title: "Klienci",
      url: "/admin/customer",
      icon: IconUsers,
    },
    {
      title: "Adresy",
      url: "/admin/address",
      icon: IconAddressBook,
    },
    {
      title: "Strony CMS",
      url: "/admin/cms",
      icon: IconFileText
    },
    {
      title: "Menu",
      url: "/admin/menu",
      icon: IconMenu
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
          
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin">
                <span className="text-base font-semibold">NestShop</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
