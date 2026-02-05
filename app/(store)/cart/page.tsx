"use client"

import * as React from "react"
import Link from "next/link"
import { z } from "zod"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { useCart } from "@/components/store/cart/cart-context"
import { apiClient } from "@/lib/api.client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { IconTrashFilled } from "@tabler/icons-react"

type Cart = z.infer<typeof cartSchema>

export default function CartPageClient({ initialCart }: { initialCart: Cart }) {
  const ctx = useCart()
  const [busyId, setBusyId] = React.useState<number | null>(null)

  // jeśli provider ma już cart, użyj go, ale na wejściu ustaw initialCart (na wszelki wypadek)
  React.useEffect(() => {
    if (!ctx?.cart) ctx?.setCart?.(initialCart)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cart = (ctx?.cart ?? initialCart) as Cart
  const items = cart.items ?? []

  const totalPrice = items.reduce(
    (sum, it) => sum + Number(it.unitPrice || 0) * Number(it.qty || 0),
    0,
  )

  async function refresh() {
    const newCart = await apiClient("/cart", {
      method: "GET",
      headers: { "x-cart-token": cart.token },
      schema: cartSchema,
    })
    ctx?.setCart?.(newCart)
  }

  async function updateQty(itemId: number, qty: number) {
    if (!Number.isFinite(qty) || qty < 1) return
    setBusyId(itemId)
    try {
        const payload = {
            qty: qty
        }


      const newCart = await apiClient(`/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "x-cart-token": cart.token },
        body: JSON.stringify(payload),
        schema: cartSchema,
      })
      ctx?.setCart?.(newCart)
      window.dispatchEvent(new CustomEvent("cart:changed", { detail: newCart }))
    } finally {
      setBusyId(null)
    }
  }

  async function removeItem(itemId: number) {
    setBusyId(itemId)
    try {
      const newCart = await apiClient(`/cart/items/${itemId}`, {
        method: "DELETE",
        headers: { "x-cart-token": cart.token },
        schema: cartSchema,
      })
      ctx?.setCart?.(newCart)
      window.dispatchEvent(new CustomEvent("cart:changed", { detail: newCart }))
    } finally {
      setBusyId(null)
    }
  }


  return (
    <div className="container  mx-auto py-8 grid gap-8 lg:grid-cols-3">
      {/* LISTA */}
      <div className="lg:col-span-2 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            Koszyk jest pusty.{" "}
            <Link className="underline" href="/">
              Wróć do zakupów
            </Link>
            .
          </div>
        ) : (
          items.map((item) => {
            const cover = item.product.images?.find((i) => i.cover)
            const imgSrc = cover?.urls?.cart_default
              ? (process.env.NEXT_PUBLIC_BACKEND_URL ?? "") + cover.urls.cart_default
              : "/images/placeholder-product.png"

            const lineTotal =
              Number(item.unitPrice || 0) * Number(item.qty || 0)

            return (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex gap-4">
                  <img
                    src={imgSrc}
                    alt={item.product.name}
                    className="h-20 w-20 rounded-md object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium"><a href={"/" + item.product.slug + "-" + item.product.id}>{item.product.name}</a></div>
                        <div className="text-sm text-muted-foreground">
                          {Number(item.unitPrice).toFixed(2).replace(".", ",")} zł / szt.
                        </div>
                      </div>

                      <button

                        className="text-muted-foreground hover:text-red-500"
                        disabled={busyId === item.id}
                        onClick={() => removeItem(item.id)}
                      >
                        <IconTrashFilled size={16} />
                      </button>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Ilość</span>
                        <Input
                          type="number"
                          min={1}
                          value={item.qty}
                          disabled={busyId === item.id}
                          onChange={(e) => updateQty(item.id, Number(e.target.value))}
                          className="w-24"
                        />
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Suma</div>
                        <div className="font-semibold">
                          {lineTotal.toFixed(2).replace(".", ",")} zł
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* PODSUMOWANIE */}
      <div className="rounded-lg border p-4 h-fit">
        <div className="text-lg font-semibold">Podsumowanie</div>
        <Separator className="my-3" />

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Produkty</span>
          <span>{totalPrice.toFixed(2).replace(".", ",")} zł</span>
        </div>

        <div className="mt-2 flex justify-between">
          <span className="text-muted-foreground">Razem</span>
          <span className="font-semibold">
            {totalPrice.toFixed(2).replace(".", ",")} zł
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          <Button disabled={items.length === 0}>
            <Link href="/checkout">Przejdź do kasy</Link>
          </Button>

        </div>
      </div>
    </div>
  )
}