// cart-context.tsx
"use client"
import React from "react"
import { z } from "zod"
import { cartSchema } from "@/lib/schemas/cart.schema"

type CartRow = z.infer<typeof cartSchema>

type CartContextType = {
  cart: CartRow | null
  setCart: React.Dispatch<React.SetStateAction<CartRow | null>>
}

type CartProviderProps = {
  initialCart: CartRow | null
  children: React.ReactNode
}

const CartCtx = React.createContext<CartContextType | null>(null)

export function CartProvider({ initialCart, children }: CartProviderProps) {
  const [cart, setCart] = React.useState<CartRow | null>(initialCart)

  React.useEffect(() => {
    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent<CartRow>).detail
      if (detail) setCart(detail)
    }
    window.addEventListener("cart:changed", onChanged)

    return () => window.removeEventListener("cart:changed", onChanged)
  }, [])

  return <CartCtx.Provider value={{ cart, setCart }}>{children}</CartCtx.Provider>
}

export function useCart(): CartContextType {
  const ctx = React.useContext(CartCtx)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
