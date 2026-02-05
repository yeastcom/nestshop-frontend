import React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import MenuForm from '@/components/admin/form/menu-form';
import { adminApiServer } from '@/lib/admin-api.server';
import { menuListSchema } from '@/lib/schemas/menu.schema';

export default async function Page() {
  const title = "Dodaj element w menu"

  const menuItems = await adminApiServer("/admin/menu", { method: "GET", schema: menuListSchema, })

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader  title={title} />
        <MenuForm menuItems={menuItems}/>
      </SidebarInset>
    </SidebarProvider>
  )
}