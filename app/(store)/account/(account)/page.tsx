import { apiServer } from "@/lib/api.server"
import { AccountForm } from "@/components/store/customer/account-form"
import { customerSchema } from "@/lib/schemas/customer.schema"
import { redirect } from "next/navigation"


export default async function Page() {
    try {
          const customer = await apiServer("/auth/me", { method: "GET", schema: customerSchema })
        return (
            <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold">Moje konto</h1>
                <p className="text-sm text-muted-foreground">
                Zmień dane konta i zapisz.
                </p>
            </div>

            <AccountForm customer={customer} />
            </div>
        )
    } catch {
        redirect("account/login");
    }

}