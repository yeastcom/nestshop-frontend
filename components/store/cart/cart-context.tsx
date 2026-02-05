// cart-context.tsx
"use client"
import React from "react"

const CartCtx = React.createContext<any>(null)

export function CartProvider({ initialCart, children }: any) {
  const [cart, setCart] = React.useState(initialCart)

  React.useEffect(() => {
    const onChanged = (e: any) => e.detail && setCart(e.detail)
    window.addEventListener("cart:changed", onChanged)

    return () => window.removeEventListener("cart:changed", onChanged)
  }, [])

  return <CartCtx.Provider value={{ cart, setCart }}>{children}</CartCtx.Provider>
}

export function useCart() {
  return React.useContext(CartCtx)
}