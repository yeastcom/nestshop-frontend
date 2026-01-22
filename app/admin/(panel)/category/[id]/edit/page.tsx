import 'ckeditor5/ckeditor5.css';
import React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import { adminApiServer } from '@/lib/admin-api.server';
import CategoryForm from '@/components/admin/form/category-form';
import { categoryListSchema, categorySchema } from '@/lib/schemas/category.schema';
export type CategoryDto = {
  id: number
  name: string
  parentId: number | null
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>
}) {
  const { id } = await params
 
  
  const category = await adminApiServer(`/admin/categories/${id}`, { method: "GET", schema: categorySchema, })
   const title = `Kategoria #${id} ${category.name}`
  // endpoint dostosuj do siebie (admin lub public)
  const tree = await adminApiServer("/admin/categories/tree", { method: "GET", schema: categoryListSchema, })
  

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
        <CategoryForm  tree={tree} category={category}/>
      </SidebarInset>
    </SidebarProvider>
  )
}