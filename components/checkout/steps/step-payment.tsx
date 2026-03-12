"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { paymentMethodSchema, paymentMethodListSchema } from "@/lib/schemas/payment-method.schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cartApi } from "@/lib/cart-api"

type StepStatus = "current" | "complete" | "disabled"
type PaymentMethod = z.infer<typeof paymentMethodSchema>

export default function CheckoutStepPayment({
  status,
  onDone,
}: {
  status: StepStatus
  cart: z.infer<typeof cartSchema>
  onDone?: (paymentMethodId: number) => void
}) {
  const router = useRouter()
  const [methods, setMethods] = React.useState<PaymentMethod[]>([])
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [placing, setPlacing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (status === "disabled") return
    cartApi<unknown>("/payment-methods")
      .then((data) => {
        const parsed = paymentMethodListSchema.safeParse(data)
        if (parsed.success) setMethods(parsed.data)
      })
      .catch(() => {})
  }, [status])

  async function handleSubmit() {
    if (!selectedId) return
    setPlacing(true)
    setError(null)
    try {
      const order = await cartApi<{ id: number; orderNumber: string }>("/orders", {
        method: "POST",
        body: JSON.stringify({ paymentMethodId: selectedId }),
      })
      onDone?.(selectedId)
      router.push(`/order-confirmation?orderId=${order.id}&orderNumber=${order.orderNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się złożyć zamówienia")
    } finally {
      setPlacing(false)
    }
  }

  if (status === "disabled") {
    return (
      <Card className="mt-5 mb-5 opacity-50">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">4. Płatność</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mt-5 mb-5">
      <CardHeader>
        <CardTitle className="text-base">4. Płatność</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {methods.length === 0 && (
          <p className="text-sm text-muted-foreground">Ładowanie metod płatności…</p>
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
              name="payment"
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
          </label>
        ))}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button
          className="mt-2 self-end"
          disabled={!selectedId || placing}
          onClick={handleSubmit}
        >
          {placing ? "Przetwarzanie…" : "Złóż zamówienie"}
        </Button>
      </CardContent>
    </Card>
  )
}
