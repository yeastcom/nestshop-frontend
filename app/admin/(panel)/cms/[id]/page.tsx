import 'ckeditor5/ckeditor5.css';
import React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import CmsForm from '@/components/admin/form/cms-form';
import { adminApiServer } from '@/lib/admin-api.server';
import { cmsSchema } from '@/lib/schemas/cms.schema';

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>
}) {
  const { id } = await params

   const cms= await adminApiServer(`/admin/cms/${id}`, { method: "GET", schema: cmsSchema, })
  const title = `Strona CMS #${id}`

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
        <CmsForm cms={cms}/>
      </SidebarInset>
    </SidebarProvider>
  )
}