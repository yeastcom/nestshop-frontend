"use client"
import { z } from "zod"
import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import { productSchema } from "@/lib/schemas/product.schema"

type ProductForCart = {
  id: number
  name: string
  stockQty: number
  price?: string
  coverUrl?: string
}

type Props = {
  product: z.infer<typeof productSchema>
  showQtyInput?: boolean // jak false/undefined => qty=1
  defaultQty?: number
}

async function addToCart(productId: number, qty: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, qty }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function AddToCartButton({
  product,
  showQtyInput = false,
  defaultQty = 1,
}: Props) {
    const cover = product.images.find((img) => img.cover === true);
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [qty, setQty] = React.useState<number>(
    Math.max(1, Math.min(defaultQty, product.stockQty || defaultQty))
  )

  const maxQty = Math.max(0, product.stockQty ?? 0)
  const effectiveQty = showQtyInput ? qty : 1

  const outOfStock = maxQty <= 0
  const invalidQty = effectiveQty < 1 || (maxQty > 0 && effectiveQty > maxQty)

  async function onAdd() {
    setError(null)

    if (outOfStock) {
      setError("Brak na stanie")
      return
    }

    // sanity
    const safeQty = showQtyInput
      ? Math.max(1, Math.min(effectiveQty, maxQty))
      : 1

    setLoading(true)
    try {
      await addToCart(product.id, safeQty)
      setOpen(true)
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się dodać do koszyka")
    } finally {
      window.dispatchEvent(new Event("cart:changed"))
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-end gap-3">
        {showQtyInput && (
          <div className="grid gap-1.5">
            <Label htmlFor={`qty-${product.id}`} className="text-xs">
              Ilość
            </Label>
            <Input
              id={`qty-${product.id}`}
              type="number"
              inputMode="numeric"
              min={1}
              max={maxQty || undefined}
              value={Number.isFinite(qty) ? qty : 1}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (!Number.isFinite(v)) return
                setQty(v)
              }}
              className="w-15"
              disabled={outOfStock}
            />
          </div>
        )}

        <Button
          onClick={onAdd}
          disabled={loading || outOfStock || invalidQty}
        >
          {outOfStock ? "Brak na stanie" : loading ? "Dodaję..." : "Dodaj do koszyka"}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Dodano do koszyka</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 items-center">
            {cover ? (
            <img
                src={process.env.NEXT_PUBLIC_BACKEND_URL +cover.urls.cart_default}
                alt={product.name}
                className="h-20 w-20 rounded-md object-cover border"
            />
            ) : (
            <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                Brak zdjęcia
            </div>
            )}

            <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            <span className="text-sm text-muted-foreground">
                Ilość: {showQtyInput ? effectiveQty : 1}
            </span>
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
            Kontynuuj zakupy
            </Button>
            <Button>
            <Link href="/cart">Przejdź do koszyka</Link>
            </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

