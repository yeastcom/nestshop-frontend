import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CategoryDataTable } from "@/components/admin/data-table/category-data.table"
import { categoryListSchema } from "@/lib/schemas/category.schema"
import { adminApiServer } from "@/lib/admin-api.server"

const title = "Kategorie";
export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>
}) {

  const { id } = await params
  const data = await adminApiServer(`/admin/categories/${id}/children`, {
    method: "GET",
    schema: categoryListSchema,
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
              <CategoryDataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
