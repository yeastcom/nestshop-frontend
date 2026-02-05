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
import { productSchema } from '@/lib/schemas/product.schema';

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>
}) {
  const { id } = await params
  const title = `Edytuj produkt ${id}`

  const product = await adminApiServer(`/admin/products/${id}`, { method: "GET", schema: productSchema })
 
  const tree = await adminApiServer("/admin/categories/tree", { method: "GET", schema: categoryListSchema })
  const categories = await adminApiServer("/admin/categories/all", { method: "GET", schema: categoryListSchema })

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
        <ProductForm product={product} categories={categories} tree={tree}/>
      </SidebarInset>
    </SidebarProvider>
  )
}