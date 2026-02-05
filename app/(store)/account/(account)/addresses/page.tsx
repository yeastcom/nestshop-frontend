import { apiServer } from "@/lib/api.server"
import { customerSchema } from "@/lib/schemas/customer.schema"
import { addressListSchema } from "@/lib/schemas/address.schema"
import AddressesClient from "@/components/store/customer/addresses/addresses-client"
export default async function Page() {
  const customer = await apiServer("/auth/me", { method: "GET", schema: customerSchema })
  const addresses = await apiServer(`/customers/${customer.id}/addresses`, {
    method: "GET",
    schema: addressListSchema,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Moje adresy</h1>
        <p className="text-sm text-muted-foreground">
          Dodawaj, edytuj i ustawiaj adresy (shipping/billing).
        </p>
      </div>

      <AddressesClient customerId={customer.id} initialAddresses={addresses} />
    </div>
  )
}