import { AppSidebar } from "@/components/admin/app-sidebar"
import { OrderDataTable } from "@/components/admin/data-table/order-data.table"
import { SiteHeader } from "@/components/admin/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { adminApiServer } from "@/lib/admin-api.server"
import { orderListSchema } from "@/lib/schemas/order.schema"
import data from "../data.json"

const title = "Zamówienia";
export default async function Page() {
  const data = await adminApiServer("/admin/orders", {
      method: "GET",
      schema: orderListSchema
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
              <OrderDataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
