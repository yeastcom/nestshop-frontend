"use client"

import { toast } from "sonner"
import * as React from "react"
import { z } from "zod"
import { categoryListSchema } from "@/lib/schemas/category.schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { CategoryTree } from "../category-tree"
import {
    ProductImagesInput,
    type ProductImage,
} from "@/components/admin/product-images-input"
import { RichTextEditor } from "@/components/RichTextEditor"
import { useRouter } from "next/navigation"
import { adminApiClient } from "@/lib/admin-api.client"
import { ProductRow } from "@/lib/schemas/product.schema"
import { productSchema } from "@/lib/schemas/product.schema"

export default function ProductForm({ product, categories, tree }: { product?: z.infer<typeof productSchema>, categories: z.infer<typeof categoryListSchema>, tree:  z.infer<typeof categoryListSchema> }) {
    // 1) flat list z propsów (jedno źródło prawdy)

    const router = useRouter()
    const [isSaving, setIsSaving] = React.useState(false)

    const [name, setName] = React.useState(product ? product.name : "")
    const [sku, setSku] = React.useState(product ? product.sku : "")
    const [slug, setSlug] = React.useState(product ? product.slug : "")
    const [description, setDescription] =React.useState<string>(product?.description ?? "")
    const [shortDescription, setShortDescription] =React.useState<string>(product?.shortDescription ?? "")
    const [price, setPrice] = React.useState(product ? product.price : "")
    const [stockQty, setStockQty] = React.useState(product ? product.stockQty : "0")
    const [isActive, setIsActive] = React.useState(product ? product.isActive : false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        // 1) walidacje frontowe
        if (!name.trim()) return alert("Podaj nazwę")
        if (!sku.trim()) return alert("Podaj SKU")
        if (!slug.trim()) return alert("Podaj SLUG")
        if (!defaultCategoryId) return alert("Wybierz kategorię domyślną")
        if (!selectedCategoryIds.includes(defaultCategoryId)) {
            // pilnujesz reguły: default musi być w zaznaczonych
            setSelectedCategoryIds((prev) => Array.from(new Set([defaultCategoryId, ...prev])))
        }

        setIsSaving(true)
        try {

          const payload = {
                name,
                sku,
                description,
                shortDescription,
                price,
                stockQty: Number(stockQty),
                isActive,
                defaultCategoryId,
                slug
            };
            if (product) {
                const prod : ProductRow = await adminApiClient(`/admin/products/${product.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                })

                await adminApiClient(`/admin/products/${prod.id}/categories`, {
                    method: "POST",
                    body: JSON.stringify({ categoryIds: selectedCategoryIds }),
                })

                const files = images.map((i: any) => i.file).filter(Boolean) as File[]

                for (let idx = 0; idx < files.length; idx++) {
                    const fd = new FormData()
                    fd.append("file", files[idx])

                    await adminApiClient(`/admin/products/${prod.id}/images`, {
                        method: "POST",
                        body: fd,
                    })
                }

                toast.success("Zaaktualizowano produkt")
            } else {
                const prod : ProductRow = await adminApiClient("/admin/products", {
                    method: "POST",
                    body: JSON.stringify(payload),
                })

                await adminApiClient(`/admin/products/${prod.id}/categories`, {
                    method: "POST",
                    body: JSON.stringify({ categoryIds: selectedCategoryIds }),
                })

                const files = images.map((i: any) => i.file).filter(Boolean) as File[]

                for (let idx = 0; idx < files.length; idx++) {
                    const fd = new FormData()
                    fd.append("file", files[idx])

                    await adminApiClient(`/admin/products/${prod.id}/images`, {
                        method: "POST",
                        body: fd,
                    })
                }

                toast.success("Dodano product")
                router.push("/admin/product")
            }
            
        } catch (err: any) {
            alert(err?.message ?? "Błąd zapisu")
        } finally {
            setIsSaving(false)
        }
    }

    const categoryIds = [];

    const productCategories = product?.categories ?? [];
    for (const item of productCategories) {
        categoryIds.push(item.id)
    }
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>(categoryIds)
    const [defaultCategoryId, setDefaultCategoryId] = React.useState<number | null>(product?.defaultCategoryId ?? null)

    // 4) select ma pokazywać tylko zaznaczone
    const defaultOptions = React.useMemo(() => {
        const selected = new Set(selectedCategoryIds)

        return categories.filter((c) => selected.has(c.id))
    }, [categories, selectedCategoryIds])

    // 5) jeśli odznaczysz default w drzewku -> reset default
    React.useEffect(() => {
        if (defaultCategoryId !== null && !selectedCategoryIds.includes(defaultCategoryId)) {
            setDefaultCategoryId(null)
        }
    }, [selectedCategoryIds, defaultCategoryId])
    const selectedDefault = defaultOptions.find((c) => c.id === defaultCategoryId)

    // 6) opcjonalnie: gdy ustawisz default, a nie ma go w selected -> dopisz do selected
    React.useEffect(() => {
        if (defaultCategoryId !== null && !selectedCategoryIds.includes(defaultCategoryId)) {
            setSelectedCategoryIds((prev) => [...prev, defaultCategoryId])
        }
    }, [defaultCategoryId])

    const savedImages = product?.images ?? []
    const oldImages : ProductImage[]= [];
    
    for (const item of savedImages) {
        let tempImage : ProductImage  = {
            id: item.id.toString(),
            originalId: item.id,
            position: item.position,
            previewUrl: process.env.NEXT_PUBLIC_BACKEND_URL + item.urls.original,
            cover: item.cover,
            productId: item.productId
        }
        oldImages.push(tempImage)
    }

    const [images, setImages] = React.useState<ProductImage[]>(oldImages)

    return (
        <form onSubmit={onSubmit}>
            <div className="mx-auto w-full p-4">
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nazwa</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Opis</Label>
                            <RichTextEditor value={description} onChange={setDescription} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="short_description">Podsumowanie</Label>
                            <RichTextEditor value={shortDescription} onChange={setShortDescription} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">SLUG</Label>
                                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                            </div>
                        </div>


                        <ProductImagesInput savedImages={savedImages} value={images} onChange={setImages} />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* 1/3 */}
                            <div className="grid gap-2 md:col-span-1">
                                <Label>Kategoria domyślna</Label>


                                <Select
                                    value={defaultCategoryId ? String(defaultCategoryId) : ""}
                                    onValueChange={(v) => setDefaultCategoryId(Number(v))}
                                    disabled={defaultOptions.length === 0}
                                >
                                    <SelectTrigger>
                                        {selectedDefault ? (
                                            <span>{selectedDefault.name}</span>
                                        ) : (
                                            <SelectValue
                                                placeholder={
                                                    defaultOptions.length
                                                        ? "Wybierz kategorię"
                                                        : "Najpierw zaznacz kategorie w drzewku"
                                                }
                                            />
                                        )}
                                    </SelectTrigger>

                                    <SelectContent>
                                        {defaultOptions.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <p className="text-xs text-muted-foreground">
                                    Wymagane (default musi należeć do zaznaczonych).
                                </p>
                            </div>

                            {/* 2/3 */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Kategorie (drzewko)</Label>
                                <CategoryTree
                                    categories={tree} // <-- tu MUSI być drzewko
                                    value={selectedCategoryIds}
                                    onChange={setSelectedCategoryIds}
                                    multiple={true}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Zaznaczone kategorie determinują listę w selekcie "domyślna".
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="text-sm font-medium">Cena i stan</div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Cena (PLN)</Label>
                                <Input id="price" inputMode="decimal" value={price} placeholder="0" onChange={(e) => setPrice(e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stockQty">Stock</Label>
                                <Input id="stockQty" type="number" value={stockQty} min={0} step={1} placeholder="0" onChange={(e) => setStockQty(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                                <div className="text-sm font-medium">Aktywny</div>
                                <div className="text-xs text-muted-foreground">
                                    Wyłączone produkty nie będą widoczne w B2C.
                                </div>
                            </div>
                            <Switch checked={isActive} onCheckedChange={setIsActive}  />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="mt-5 flex items-center justify-end gap-2">
                    <Button type="submit" disabled={!defaultCategoryId || isSaving}>
                        {isSaving ? "Zapisywanie..." : "Zapisz"}
                    </Button>
                </CardFooter>
            </div>
        </form>
    )
}