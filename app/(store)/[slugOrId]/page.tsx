// app/[slugOrId]/page.tsx
import { notFound, redirect } from "next/navigation"
import { apiServer } from "@/lib/api.server"
import { categoryProductSchema, productSchema } from "@/lib/schemas/product.schema"
import { categorySchema } from "@/lib/schemas/category.schema"
import CategoryPage from "@/components/store/category-page"
import ProductPage from "@/components/store/product-page"

const API = process.env.NEXT_PUBLIC_API_URL
if (!API) throw new Error("Missing NEXT_PUBLIC_API_URL")

type Kind =
  | { kind: "product"; id: number; slug: string }
  | { kind: "category"; id: number; slug: string }

function detect(param: string): Kind | null {
  const cat = param.match(/^(\d+)-(.+)$/)
  if (cat) return { kind: "category", id: Number(cat[1]), slug: cat[2] }

  // produkt: "something-123"
  const prod = param.match(/^(.*)-(\d+)$/)
  if (prod) return { kind: "product", id: Number(prod[2]), slug: prod[1] }

  return null
}

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ slugOrId: string }>,
  searchParams: Promise<{page?: string}>
}) {
    const { slugOrId } = await params

  const kind = detect(slugOrId)
  if (!kind) notFound()

  if (kind.kind === "product") {
     const product = await apiServer(`/products/${kind.id}`, { method: "GET", schema: productSchema })

    if (!product) notFound()

    // canonical (jak zmienił się slug)
    if (product.slug && product.slug !== kind.slug) {
      redirect(`/${product.slug}-${product.id}`)
    }

    return (
      <ProductPage product={product}/>
    )
  }

  if (kind.kind === "category") {
    const category = await apiServer(
      `/categories/${kind.id}`,
      {
        method: "GET",
        schema: categorySchema
      }
    )

    const { page } = (await searchParams)
    const p = page ?? 1;

    
    if (!category) notFound()

    if (category.slug && category.slug !== kind.slug) {
      redirect(`/${category.id}-${category.slug}`)
    }

    const limit = 12;

    const products = await apiServer(
        `/categories/${category.id}/products?page=${p}&limit=${limit}`,
        {
            method: "GET",
            schema: categoryProductSchema
        }
    )

    return (
      <CategoryPage products={products} category={category}/>
    )
  }

  notFound()
}