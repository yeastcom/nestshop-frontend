"use client"

import * as React from "react"
import { z } from "zod"

import { cartSchema } from "@/lib/schemas/cart.schema"
import { customerSchema } from "@/lib/schemas/customer.schema"
import { addressSchema } from "@/lib/schemas/address.schema"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AddressForm, type AddressFormValues } from "../_partials/address-form"
import { cartApi } from "@/lib/cart-api"
import { apiClient } from "@/lib/api.client"

type StepStatus = "current" | "complete" | "disabled"
type AddressDto = z.infer<typeof addressSchema>

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
      <input type="radio" checked={checked} onChange={onPick} className="mt-1" />
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

function AddressSummary({ addr }: { addr: AddressDto }) {
  return (
    <div className="text-sm">
      <p className="font-medium">{addr.street}, {addr.postalCode} {addr.city}</p>
      <p className="text-muted-foreground">{addr.countryCode}{addr.phone ? ` • ${addr.phone}` : ""}</p>
    </div>
  )
}

export default function CheckoutStepAddress({
  status,
  cart,
  customer,
  onDone,
  onEdit,
}: {
  status: StepStatus
  cart: z.infer<typeof cartSchema>
  customer?: z.infer<typeof customerSchema>
  onDone: (deliveryAddressId: number, invoiceAddressId: number | null) => void
  onEdit: () => void
}) {
  const initialAddresses = (customer?.addresses ?? []) as AddressDto[]
  const [addresses, setAddresses] = React.useState<AddressDto[]>(initialAddresses)

  const shippingAddresses = addresses.filter((a) => a.type === "shipping")
  const billingAddresses = addresses.filter((a) => a.type === "billing")

  const defaultShipping = shippingAddresses.find((a) => a.isDefault) ?? shippingAddresses[0]
  const defaultBilling = billingAddresses.find((a) => a.isDefault) ?? billingAddresses[0]

  const [selectedShippingId, setSelectedShippingId] = React.useState<number | null>(
    cart.deliveryAddress?.id ?? defaultShipping?.id ?? null
  )
  const [selectedBillingId, setSelectedBillingId] = React.useState<number | null>(
    cart.invoiceAddress?.id ?? defaultBilling?.id ?? null
  )
  const [useDifferentBilling, setUseDifferentBilling] = React.useState(!!cart.invoiceAddress)
  const [showNewShipping, setShowNewShipping] = React.useState(shippingAddresses.length === 0)
  const [showNewBilling, setShowNewBilling] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // sync addresses when customer changes (e.g. after re-mount)
  React.useEffect(() => {
    setAddresses((customer?.addresses ?? []) as AddressDto[])
  }, [customer])

  async function createAddress(values: AddressFormValues) {
    if (!customer?.id) throw new Error("Brak customerId")
    const created = await apiClient<AddressDto>(`/customers/${customer.id}/addresses`, {
      method: "POST",
      body: JSON.stringify(values),
    })
    setAddresses((prev) => [...prev, created])
    if (created.type === "shipping") {
      setSelectedShippingId(created.id)
      setShowNewShipping(false)
    }
    if (created.type === "billing") {
      setSelectedBillingId(created.id)
      setShowNewBilling(false)
    }
  }

  async function handleSubmit() {
    if (!selectedShippingId) return
    setSaving(true)
    setError(null)
    try {
      const invoiceAddressId = useDifferentBilling ? (selectedBillingId ?? null) : null
      await cartApi("/cart", {
        method: "PATCH",
        body: JSON.stringify({
          deliveryAddressId: selectedShippingId,
          ...(invoiceAddressId ? { invoiceAddressId } : {}),
        }),
      })
      onDone(selectedShippingId, invoiceAddressId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Błąd zapisu adresu")
    } finally {
      setSaving(false)
    }
  }

  // --- DISABLED ---
  if (status === "disabled") {
    return (
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Adres dostawy</CardTitle>
          <CardDescription>Adres będziesz mógł wypełnić po uzupełnieniu danych klienta</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // --- COMPLETE ---
  if (status === "complete") {
    const deliveryAddr = addresses.find((a) => a.id === selectedShippingId)
    const invoiceAddr = useDifferentBilling ? addresses.find((a) => a.id === selectedBillingId) : null

    return (
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Adres dostawy</CardTitle>
          <CardDescription>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                {deliveryAddr && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Dostawa</p>
                    <AddressSummary addr={deliveryAddr} />
                  </div>
                )}
                {invoiceAddr && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Faktura</p>
                    <AddressSummary addr={invoiceAddr} />
                  </div>
                )}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                Zmień
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // --- CURRENT ---
  const canContinue = !!selectedShippingId && (!useDifferentBilling || !!selectedBillingId)

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Adres dostawy</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SHIPPING */}
        <div className="space-y-3">
          {shippingAddresses.length > 0 && !showNewShipping && (
            <>
              {shippingAddresses.map((a) => (
                <AddressRadio
                  key={a.id}
                  addr={a}
                  checked={selectedShippingId === a.id}
                  onPick={() => setSelectedShippingId(a.id)}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => { setShowNewShipping(true); setSelectedShippingId(null) }}>
                + Nowy adres dostawy
              </Button>
            </>
          )}

          {showNewShipping && (
            <div className="space-y-3">
              <AddressForm type="shipping" onSubmit={createAddress} submitLabel="Dodaj adres dostawy" />
              {shippingAddresses.length > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowNewShipping(false); setSelectedShippingId(defaultShipping?.id ?? null) }}>
                  Anuluj
                </Button>
              )}
            </div>
          )}
        </div>

        {/* BILLING TOGGLE */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="diffBilling"
              checked={useDifferentBilling}
              onCheckedChange={(v) => {
                setUseDifferentBilling(!!v)
                if (!v) setShowNewBilling(false)
              }}
            />
            <Label htmlFor="diffBilling" className="cursor-pointer font-normal">
              Inny adres do faktury
            </Label>
          </div>

          {useDifferentBilling && (
            <div className="space-y-3">
              {billingAddresses.length > 0 && !showNewBilling && (
                <>
                  {billingAddresses.map((a) => (
                    <AddressRadio
                      key={a.id}
                      addr={a}
                      checked={selectedBillingId === a.id}
                      onPick={() => setSelectedBillingId(a.id)}
                    />
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowNewBilling(true); setSelectedBillingId(null) }}>
                    + Nowy adres do faktury
                  </Button>
                </>
              )}

              {(showNewBilling || billingAddresses.length === 0) && (
                <div className="space-y-3">
                  <AddressForm type="billing" onSubmit={createAddress} submitLabel="Dodaj adres do faktury" />
                  {billingAddresses.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setShowNewBilling(false); setSelectedBillingId(defaultBilling?.id ?? null) }}>
                      Anuluj
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end">
          <Button type="button" disabled={!canContinue || saving} onClick={handleSubmit}>
            {saving ? "Zapisywanie…" : "Dalej"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
