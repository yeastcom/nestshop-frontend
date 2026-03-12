"use client"

import * as React from "react"
import { z } from "zod"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { deliveryMethodSchema, deliveryMethodListSchema } from "@/lib/schemas/delivery-method.schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cartApi } from "@/lib/cart-api"
import { useCart } from "@/components/store/cart/cart-context"

type StepStatus = "current" | "complete" | "disabled"
type DeliveryMethod = z.infer<typeof deliveryMethodSchema>

export default function CheckoutStepDelivery({
  status,
  cart,
  onDone,
  onEdit,
}: {
  status: StepStatus
  cart: z.infer<typeof cartSchema>
  onDone?: () => void
  onEdit?: () => void
}) {
  const { setCart } = useCart()
  const [methods, setMethods] = React.useState<DeliveryMethod[]>([])
  const [selectedId, setSelectedId] = React.useState<number | null>(
    cart.deliveryMethod?.id ?? null
  )
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (status === "disabled") return
    cartApi<unknown>("/delivery-methods")
      .then((data) => {
        const parsed = deliveryMethodListSchema.safeParse(data)
        if (parsed.success) setMethods(parsed.data)
      })
      .catch(() => {})
  }, [status])

  async function handleSubmit() {
    if (!selectedId) return
    setSaving(true)
    try {
      const updatedCart = await cartApi<z.infer<typeof cartSchema>>("/cart", {
        method: "PATCH",
        body: JSON.stringify({ deliveryMethodId: selectedId }),
      })
      setCart(updatedCart)
      window.dispatchEvent(new CustomEvent("cart:changed", { detail: updatedCart }))
      onDone?.()
    } finally {
      setSaving(false)
    }
  }

  if (status === "disabled") {
    return (
      <Card className="mt-5 opacity-50">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">3. Metoda dostawy</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (status === "complete") {
    const method = cart.deliveryMethod
    return (
      <Card className="mt-5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Metoda dostawy</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            Zmień
          </Button>
        </CardHeader>
        {method && (
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{method.name}</p>
                {method.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                )}
              </div>
              <span className="text-sm font-semibold">{Number(method.price).toFixed(2)} zł</span>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle className="text-base">Metoda dostawy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {methods.length === 0 && (
          <p className="text-sm text-muted-foreground">Ładowanie metod dostawy…</p>
        )}
        {methods.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
              selectedId === m.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="delivery"
              value={m.id}
              checked={selectedId === m.id}
              onChange={() => setSelectedId(m.id)}
              className="accent-primary"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">{m.name}</div>
              {m.description && (
                <div className="text-xs text-muted-foreground">{m.description}</div>
              )}
            </div>
            <div className="text-sm font-semibold">{Number(m.price).toFixed(2)} zł</div>
          </label>
        ))}
        <Button
          className="mt-2 self-end"
          disabled={!selectedId || saving}
          onClick={handleSubmit}
        >
          {saving ? "Zapisywanie…" : "Dalej"}
        </Button>
      </CardContent>
    </Card>
  )
}
