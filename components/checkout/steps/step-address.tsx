"use client"

import * as React from "react"
import { z } from "zod"

import { cartSchema } from "@/lib/schemas/cart.schema"
import { customerSchema } from "@/lib/schemas/customer.schema"
import { addressSchema } from "@/lib/schemas/address.schema"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AddressForm, type AddressFormValues } from "../_partials/address-form"
import { apiClient } from "@/lib/api.client"

type StepStatus = "current" | "complete" | "disabled"
type AddressDto = z.infer<typeof addressSchema>

export default function CheckoutStepAddress({
  status,
  cart,
  customer,
}: {
  status: StepStatus
  cart: z.infer<typeof cartSchema>
  customer?: z.infer<typeof customerSchema>
}) {
  let description: React.ReactNode = null

  const [useDifferentBilling, setUseDifferentBilling] = React.useState(false)

  // lokalny wybór (na start)
  const [selectedShippingId, setSelectedShippingId] = React.useState<number | null>(null)
  const [selectedBillingId, setSelectedBillingId] = React.useState<number | null>(null)

  if (status === "disabled") {
    description = "Adres będziesz mógł wypełnić po uzupełnieniu danych klienta"
  } else if (status === "current") {
    description = "Wybierz adres dostawy"
  }

  if (status !== "current") {
    return (
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Adres</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const addresses = (customer?.addresses ?? []) as AddressDto[]
  const shippingAddresses = addresses.filter((a) => a.type === "shipping")
  const billingAddresses = addresses.filter((a) => a.type === "billing")

  async function createAddress(values: AddressFormValues) {
    if (!customer?.id) throw new Error("Brak customerId")

    // zakładam, że backend ma: POST /customers/:id/addresses
    const created = await apiClient<AddressDto>(`/customers/${customer.id}/addresses`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
    })

    // tu najlepiej: odświeżyć customer (albo dispatch event i w kontekscie podmienić)
    // MVP: ustawiamy od razu zaznaczony adres na nowo utworzony
    if (created.type === "shipping") setSelectedShippingId(created.id)
    if (created.type === "billing") setSelectedBillingId(created.id)

    // TODO: odśwież dane customer/addresses w parent/state
  }

  function AddressRadio({
    addr,
    checked,
    onPick,
  }: {
    addr: AddressDto
    checked: boolean
    onPick: () => void
  }) {
    return (
      <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent">
        <input
          type="radio"
          checked={checked}
          onChange={onPick}
          className="mt-1"
        />
        <div className="text-sm">
          <div className="font-medium">
            {addr.street}, {addr.postalCode} {addr.city}
          </div>
          <div className="text-muted-foreground">
            {addr.countryCode}
            {addr.phone ? ` • ${addr.phone}` : ""}
            {addr.company ? ` • ${addr.company}` : ""}
          </div>
        </div>
      </label>
    )
  }

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Adres</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SHIPPING */}
        <div className="space-y-3">

          {shippingAddresses.length > 0 ? (
            <div className="space-y-2">
              {shippingAddresses.map((a) => (
                <AddressRadio
                  key={a.id}
                  addr={a}
                  checked={selectedShippingId === a.id || (!selectedShippingId && a.isDefault)}
                  onPick={() => setSelectedShippingId(a.id)}
                />
              ))}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedShippingId(null)}
                >
                  Dodaj nowy adres dostawy
                </Button>
              </div>

              {/* jeśli user kliknął “dodaj nowy” */}
              {selectedShippingId === null && (
                <div>
                  <AddressForm
                    type="shipping"
                    onSubmit={createAddress}
                    submitLabel="Dodaj adres dostawy"
                  />
                </div>
              )}
            </div>
          ) : (
            <div >
              <AddressForm
                type="shipping"
                onSubmit={createAddress}
                submitLabel="Dodaj adres dostawy"
              />
            </div>
          )}
        </div>

        {/* BILLING TOGGLE */}
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useDifferentBilling}
              onChange={(e) => setUseDifferentBilling(e.target.checked)}
            />
            <span>Inny adres do faktury niż adres dostawy</span>
          </label>

          {useDifferentBilling && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Adres do faktury</div>

              {billingAddresses.length > 0 ? (
                <div className="space-y-2">
                  {billingAddresses.map((a) => (
                    <AddressRadio
                      key={a.id}
                      addr={a}
                      checked={selectedBillingId === a.id || (!selectedBillingId && a.isDefault)}
                      onPick={() => setSelectedBillingId(a.id)}
                    />
                  ))}

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedBillingId(null)}
                    >
                      Dodaj nowy adres do faktury
                    </Button>
                  </div>

                  {selectedBillingId === null && (
                    <div >
                      <AddressForm
                        type="billing"
                        onSubmit={createAddress}
                        submitLabel="Dodaj adres do faktury"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <AddressForm
                    type="billing"
                    onSubmit={createAddress}
                    submitLabel="Dodaj adres do faktury"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* TODO: dalej przycisk “Dalej” i zapis wyboru do cart/checkout */}
        <div className="flex justify-end">
          <Button type="button" disabled={!selectedShippingId && shippingAddresses.length > 0}>
            Dalej
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}