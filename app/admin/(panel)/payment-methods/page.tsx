import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { adminApiServer } from "@/lib/admin-api.server"
import { paymentMethodListSchema } from "@/lib/schemas/payment-method.schema"
import { PaymentMethodDataTable } from "@/components/admin/data-table/payment-method-data-table"

export default async function Page() {
  const data = await adminApiServer("/admin/payment-methods", {
    method: "GET",
    schema: paymentMethodListSchema,
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
        <SiteHeader title="Metody płatności" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <PaymentMethodDataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
