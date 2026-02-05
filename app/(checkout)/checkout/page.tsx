"use client"

import { Separator } from "@/components/ui/separator"
import CheckoutSteps from "@/components/checkout/checkout-step";
import { useCart } from "@/components/store/cart/cart-context"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { z } from "zod"

type Cart = z.infer<typeof cartSchema>

export default function Page() {
     const ctx = useCart()
     const cart = (ctx.cart ) as Cart
     const items = cart.items ?? []
    const totalPrice = items.reduce(
        (sum, it) => sum + Number(it.unitPrice || 0) * Number(it.qty || 0),
        0,
    )
return (<div className="container  mx-auto py-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4"><CheckoutSteps cart={cart}/></div>
        <div className="rounded-lg border p-4 h-fit sticky top-0">
        <div className="text-lg font-semibold">Podsumowanie</div>
        <Separator className="my-3" />

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Produkty</span>
          <span>{totalPrice.toFixed(2).replace(".", ",")} zł</span>
        </div>

        <div className="mt-2 flex justify-between ">
          <span className="text-muted-foreground">Razem</span>
          <span className="font-semibold">
            {totalPrice.toFixed(2).replace(".", ",")} zł
          </span>
        </div>

      </div>
        </div>);

}