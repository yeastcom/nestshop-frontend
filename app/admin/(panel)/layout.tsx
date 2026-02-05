import { redirect } from "next/navigation"
import { adminApiServer } from "@/lib/admin-api.server"
import { Toaster } from "sonner"
import { adminAuthSchema } from "@/lib/schemas/admin-auth.schema"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await adminApiServer("/admin/auth/me", { method: "GET", schema: adminAuthSchema })
  } catch (e) {
      console.log("[admin layout auth failed]", String(e))

    redirect("/admin/login")
  }

  return <>{children}                    <Toaster richColors position="top-right" /></>
}