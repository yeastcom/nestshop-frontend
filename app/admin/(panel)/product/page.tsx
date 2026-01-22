import { AppSidebar } from "@/components/admin/app-sidebar"
import { adminApiServer } from "@/lib/admin-api.server"
import { SiteHeader } from "@/components/admin/site-header"
import { ProductDataTable } from "@/components/admin/data-table/product-data-table"
import { productListSchema } from "@/lib/schemas/product.schema"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const dynamic = "force-dynamic"
export const revalidate = 0

const title = "Produkty";




export default async function Page() {
  const data = await adminApiServer("/admin/products", {
  method: "GET",
  schema: productListSchema,
})

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
        <SiteHeader title={title}/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <ProductDataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
