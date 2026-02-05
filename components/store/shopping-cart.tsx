"use client"

import * as React from "react"
import Link from "next/link"
import { z } from "zod"
import { IconShoppingCartFilled, IconTrashFilled } from "@tabler/icons-react"

import { cartSchema, cartItemSchema } from "@/lib/schemas/cart.schema"
import { apiClient } from "@/lib/api.client"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"

type Cart = z.infer<typeof cartSchema>
type CartItem = z.infer<typeof cartItemSchema>

function formatPrice(pln: number) {
  return pln.toFixed(2).replace(".", ",") + " zł"
}

export function CartImage({ cartItem }: { cartItem: CartItem }) {
  const cover = cartItem.product.images.find((img) => img.cover)
  if (!cover) return null

  const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}${cover.urls.cart_default}`

  return (
    <img
      src={src}
      alt={cartItem.product.name}
      className="h-16 w-16 rounded-md object-cover"
    />
  )
}

export function ShoppingCart({ initialCart }: { initialCart: Cart }) {

  const [cart, setCart] = React.useState<Cart>(initialCart)

  // jeśli SSR dał cart bez tokena a potem się pojawił, możesz zsynchronizować:
  React.useEffect(() => {
    setCart(initialCart)
  }, [initialCart])

  const items = cart.items ?? []

  const totalQty = React.useMemo(
    () => items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    [items],
  )

  const totalPrice = React.useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.qty || 0),
        0,
      ),
    [items],
  )

  async function refreshCart() {
    // fallback: odśwież z API
    const newCart = await apiClient("/cart", {
      method: "GET",
      headers: cart.token ? { "X-Cart-Token": cart.token } : undefined,
      schema: cartSchema,
    })
    setCart(newCart)
  }

  // EVENT BUS: gdy ktoś zrobi add/update/delete -> wysyła CustomEvent z detail=cart
  React.useEffect(() => {
    function handler(e: Event) {
      const ce = e as CustomEvent<Cart | undefined>
      if (ce.detail) {
        setCart(ce.detail)
      } else {
        // jak ktoś wyśle event bez detail -> fallback na GET
        refreshCart()
      }
    }

    window.addEventListener("cart:changed", handler as EventListener)
    return () => window.removeEventListener("cart:changed", handler as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.token]) // token może się zmienić po 1. GET
  

  async function handleClickDelete(id: number) {
    const newCart = await apiClient(`/cart/items/${id}`, {
      method: "DELETE",
      headers: cart.token ? { "X-Cart-Token": cart.token } : undefined,
      schema: cartSchema,
    })

    setCart(newCart)
    window.dispatchEvent(new CustomEvent("cart:changed", { detail: newCart }))
  }

    return (
        <Sheet>
            {/* ICONA */}
            <SheetTrigger>
                <div className="relative cursor-pointer">
                    <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white">
                        {totalQty}
                    </div>
                    <IconShoppingCartFilled size={30} />
                </div>
            </SheetTrigger>

            {/* PANEL Z PRAWEJ */}
            <SheetContent side="right" className="flex w-full max-w-md flex-col">
                <SheetHeader>
                    <SheetTitle>Koszyk</SheetTitle>
                </SheetHeader>

                {/* LISTA PRODUKTÓW */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Koszyk jest pusty
                        </p>
                    )}

                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 border-b pb-3"
                        >

                            <CartImage cartItem={item} />

                            <div className="flex-1">
                                <p className="text-sm font-medium">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    Ilość: {item.qty}
                                </p>
                                <p className="text-sm font-semibold">
                                    {Number(item.unitPrice).toFixed(2).replace(".", ",")} zł
                                </p>
                            </div>

                            <button className="text-muted-foreground hover:text-red-500" onClick={() => handleClickDelete(item.id)}>
                                <IconTrashFilled size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* STOPKA */}
                <SheetFooter>
                    <div className="flex justify-between text-md">
                        <span className="text-muted-foreground">Produkty</span>
                        <span>{totalPrice.toFixed(2).replace(".", ",")} zł</span>
                    </div>

                    <div className="flex justify-between text-lg">
                        <span className="text-muted-foreground">Razem</span>
                        <span className="font-semibold">
                            {totalPrice.toFixed(2).replace(".", ",")} zł
                        </span>
                    </div>
                    <a href="/cart" className="w-full">
                        <Button className="w-full">
                            Przejdź do koszyka
                        </Button>
                    </a>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}