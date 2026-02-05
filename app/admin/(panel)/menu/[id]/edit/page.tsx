import React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import MenuForm from '@/components/admin/form/menu-form';
import { adminApiServer } from '@/lib/admin-api.server';
import { menuListSchema, menuSchema } from '@/lib/schemas/menu.schema';

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>
}) {
  const { id } = await params
  const title = "Edytuj element w menu #" + id

  const menuItems = await adminApiServer("/admin/menu", { method: "GET", schema: menuListSchema, })
  const menu = await adminApiServer(`/admin/menu/${id}`, { method: "GET", schema: menuSchema, })
  
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
        <MenuForm menuItems={menuItems} menu={menu}/>
      </SidebarInset>
    </SidebarProvider>
  )
}