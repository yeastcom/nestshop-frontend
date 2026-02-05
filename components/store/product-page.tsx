"use client"

import Link from "next/link"
import { z } from "zod"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "../ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { productSchema } from "@/lib/schemas/product.schema"
import { cartApi } from "@/lib/cart-api"
import { AddToCartButton } from "./add-to-cart-button"

export default function ProductPage({ product }: { product: z.infer<typeof productSchema>}) {
    const cover = product.images.find((img) => img.cover === true);
    const [mainImage, setMainImage] = React.useState(cover)
    const BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_URL

    function handleClickChangeMainImage(id: number) {
        const image = product.images.find((img) => img.id === id)
        setMainImage(image)
    }


  return (
    <>
    <div className="mx-auto container px-4 py-8">
      {/* breadcrumbs */}
      <div className="mb-4 text-sm text-muted-foreground mb-4">
        <Link className="hover:underline" href="/">
          Strona główna
        </Link>{" "}
        /{" "}
        <Link
          className="hover:underline"
          href={`/${product.defaultCategory?.id}-${product.defaultCategory?.slug ?? ""}`}
        >
          {product.defaultCategory?.name}
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-4">
        {/* galeria */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {mainImage ? (
              <img
                src={BACKEND_DOMAIN + mainImage.urls.large_default}
                alt={product.name}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {product.images
              .slice()
              .sort((a, b) => a.position - b.position)
              .slice(0, 10)
              .map((img) => (
                <div
                  key={img.id}
                  className={"relative aspect-square overflow-hidden rounded-md border cursor-pointer p-1 " + (mainImage && img.id == mainImage.id ? " border-black" : '')}
                  onClick={() => handleClickChangeMainImage(img.id)}
                >
                  <img
                    src={BACKEND_DOMAIN + img.urls.home_default}
                    alt={product.name}
      
                    className="object-cover"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* dane produktu */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            {!product.isActive ? <Badge variant="secondary">Nieaktywny</Badge> : null}
          </div>

          <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>

          <div className="text-3xl font-semibold">
            {Number(product.price).toFixed(2).replace(".", ",")} zł
          </div>

          <div className="flex items-center gap-2">
            {product.stockQty > 0 ? (
              <Badge>W magazynie: {product.stockQty}</Badge>
            ) : (
              <Badge variant="destructive">Brak w magazynie</Badge>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            <AddToCartButton product={product} showQtyInput defaultQty={1} />
          </div>

          {product.shortDescription ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: product.shortDescription ?? "" }}
                />
            </div>
          ) : null}
        </div>
      </div>
        <Separator />
           {product.description ? (
            <div className="prose prose-sm max-w-none dark:prose-invert mt-2">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: product.description ?? "" }}
                />
            </div>
          ) : null}
    </div>

    </>
  )
}