import { redirect } from "next/navigation"
import { adminApiServer } from "@/lib/admin-api.server"
import { Toaster } from "sonner"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await adminApiServer("/admin/auth/me", { method: "GET" })
  } catch (e) {
      console.log("[admin layout auth failed]", String(e))

    redirect("/admin/login")
  }

  return <>{children}                    <Toaster richColors position="top-right" /></>
}