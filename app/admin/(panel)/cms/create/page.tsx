import 'ckeditor5/ckeditor5.css';
import React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import CmsForm from '@/components/admin/form/cms-form';

export type CategoryDto = {
  id: number
  name: string
  parentId: number | null
}

export default async function Page() {
  const title = "Stwórz stronę CMS"

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
        <SiteHeader title={title} />
        <CmsForm />
      </SidebarInset>
    </SidebarProvider>
  )
}