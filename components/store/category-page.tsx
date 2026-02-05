import Link from "next/link"
import { z } from "zod"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { categorySchema } from "@/lib/schemas/category.schema"
import { categoryProductSchema } from "@/lib/schemas/product.schema"
import { productSchema } from "@/lib/schemas/product.schema"
import { AddToCartButton } from "./add-to-cart-button"

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL")

function pageHref(category: z.infer<typeof categorySchema>, page: number) {
    return `/${category.id}-${category.slug}?page=${page}`
}

function ProductCard({ p }: { p: z.infer<typeof productSchema>}) {
    const img = p.images?.find((i) => i.cover) ?? p.images?.[0]
    const src = img?.urls?.medium_default

    return (

        <Card className="h-full hover:bg-muted/40 transition-colors">
            <Link href={`/${p.slug}-${p.id}`} className="block">
                <CardContent className="space-y-3">
                    {src ? (
                        <img
                            src={process.env.NEXT_PUBLIC_BACKEND_URL + src}
                            alt={p.name}
                            className="w-full rounded-md object-cover"
                            loading="lazy"

                        />
                    ) : (
                        <div className="w-full h-79 rounded-md bg-muted" />
                    )}
                </CardContent>
                <CardHeader className="pt-2">
                    <CardTitle className="line-clamp-2 text-base">{p.name}</CardTitle>
                </CardHeader>
            </Link>
            <CardFooter>
                <div className="w-100">
                    <div className="font-medium">{p.price} zł</div>
                </div>
                <AddToCartButton product={p}/>
            </CardFooter>

        </Card>
    )
}

export default function CategoryPage({ products, category }: { products: z.infer<typeof categoryProductSchema>, category: z.infer<typeof categorySchema> }) {

    const isPrevDisabled = products.page <= 1
    const isNextDisabled = products.page >= products.totalPages

    return (
        <div className="mx-auto container px-4 py-8">
            <div className="mb-6 flex items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">{category.name}</h1>
                    <div className="category-description">
                        {category.description}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {products.total} produktów
                    </div>
                </div>

                {/* miejsce na sort / filtry później */}
            </div>

            {/* grid 3/wiersz */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.items.map((p) => (
                    <ProductCard key={p.id} p={p} />
                ))}
            </div>
                        
                    <Pagination className="mt-6">
                        <PaginationContent>
                            <PaginationItem>
                                {isPrevDisabled ? (
                    <DisabledPageControl>
                    <PaginationPrevious href="#" />
                    </DisabledPageControl>
                    ) : (
                                <PaginationPrevious href={pageHref(category, products.page - 1)} aria-disabled={products.page <= 1}  />

                     )}
                    </PaginationItem>

                    {Array.from({ length: products.totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                        <PaginationLink href={pageHref(category, p)} isActive={p === products.page}>
                        {p}
                        </PaginationLink>
                    </PaginationItem>
                    ))}

                    <PaginationItem>
                         {isNextDisabled ? (
            <DisabledPageControl>
              <PaginationNext href="#" />
            </DisabledPageControl>
          ) : (
                    <PaginationNext href={pageHref(category, products.page + 1)} aria-disabled={products.page >= products.totalPages} />

          )}
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

function DisabledPageControl({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-disabled="true"
      className="pointer-events-none opacity-50"
    >
      {children}
    </span>
  )
}