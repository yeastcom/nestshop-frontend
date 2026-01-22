import 'ckeditor5/ckeditor5.css';
import React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import { categoryListSchema } from '@/lib/schemas/category.schema';
import { adminApiServer } from '@/lib/admin-api.server';
import ProductForm from '@/components/admin/form/product-form';


export default async function Page() {
  const title = "Stwórz produkt"

  // endpoint dostosuj do siebie (admin lub public)
  const tree = await adminApiServer("/admin/categories/tree", { method: "GET", schema: categoryListSchema })
  const categories = await adminApiServer("/admin/categories", { method: "GET", schema: categoryListSchema })

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
        <ProductForm categories={categories} tree={tree}/>
      </SidebarInset>
    </SidebarProvider>
  )
}