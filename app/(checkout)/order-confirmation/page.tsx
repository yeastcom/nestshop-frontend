"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cartApi } from "@/lib/cart-api"
import { orderSchema } from "@/lib/schemas/order.schema"
import { z } from "zod"

type Order = z.infer<typeof orderSchema>

function AddressBlock({ label, address }: { label: string; address: Order["deliveryAddress"] }) {
  if (!address) return null
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      {address.fullName && <p className="text-sm">{address.fullName}</p>}
      {address.company && <p className="text-sm">{address.company}</p>}
      {address.street && <p className="text-sm">{address.street}</p>}
      {(address.postalCode || address.city) && (
        <p className="text-sm">{address.postalCode} {address.city}</p>
      )}
      {address.countryCode && <p className="text-sm">{address.countryCode}</p>}
      {address.phone && <p className="text-sm">{address.phone}</p>}
    </div>
  )
}

function OrderDetails() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const orderNumber = searchParams.get("orderNumber")

  const [order, setOrder] = React.useState<Order | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    cartApi<unknown>(`/orders/${orderId}`)
      .then((data) => {
        const parsed = orderSchema.safeParse(data)
        if (parsed.success) setOrder(parsed.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  return (
    <div className="container mx-auto py-16 max-w-2xl space-y-8">
      <div className="text-center space-y-3">
        <div className="text-5xl">✓</div>
        <h1 className="text-2xl font-semibold">Zamówienie złożone!</h1>
        {orderNumber && (
          <p className="text-muted-foreground text-sm">
            Numer zamówienia: <span className="font-medium text-foreground">{orderNumber}</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Dziękujemy za zakup. Potwierdzenie zostanie wysłane na Twój adres e-mail.
        </p>
      </div>

      {loading && (
        <p className="text-center text-sm text-muted-foreground">Ładowanie szczegółów…</p>
      )}

      {!loading && order && (
        <div className="space-y-6">
          <Separator />

          {/* Produkty */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Zamówione produkty</p>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name}
                    {item.sku && <span className="text-muted-foreground ml-1">({item.sku})</span>}
                    <span className="text-muted-foreground ml-1">× {item.qty}</span>
                  </span>
                  <span className="font-medium">{Number(item.lineTotal).toFixed(2).replace(".", ",")} zł</span>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Produkty</span>
                <span>{Number(order.itemsTotal).toFixed(2).replace(".", ",")} zł</span>
              </div>
              {order.shippingTotal && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Dostawa</span>
                  <span>{Number(order.shippingTotal).toFixed(2).replace(".", ",")} zł</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Razem</span>
                <span>{Number(order.total).toFixed(2).replace(".", ",")} zł</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Adresy */}
          <div className="grid sm:grid-cols-2 gap-6">
            <AddressBlock label="Adres dostawy" address={order.deliveryAddress} />
            {order.invoiceAddress && (
              <AddressBlock label="Adres rozliczeniowy" address={order.invoiceAddress} />
            )}
          </div>

          <Separator />

          {/* Metody */}
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            {order.deliveryMethod && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Metoda dostawy</p>
                <p>{order.deliveryMethod.name}</p>
                <p className="text-muted-foreground">{Number(order.deliveryMethod.price).toFixed(2).replace(".", ",")} zł</p>
              </div>
            )}
            {order.paymentMethod && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Metoda płatności</p>
                <p>{order.paymentMethod.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Separator />
      <div className="text-center">
        <Button>
          <Link href="/">Wróć do sklepu</Link>
        </Button>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <React.Suspense fallback={
      <div className="container mx-auto py-16 max-w-2xl text-center text-sm text-muted-foreground">
        Ładowanie…
      </div>
    }>
      <OrderDetails />
    </React.Suspense>
  )
}
