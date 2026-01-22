"use client"

import { toast } from "sonner"
import * as React from "react"
import { z } from "zod"
import { categoryListSchema } from "@/lib/schemas/category.schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
    type LocalImage,
} from "@/components/admin/product-images-input"
import { buildCategoryTree, type CategoryFlat } from "@/lib/categories"
import { useRouter } from "next/navigation"
import { adminApiClient } from "@/lib/admin-api.client"
import { ProductRow } from "@/lib/schemas/product.schema"

export default function ProductForm({ categories, tree }: { categories: z.infer<typeof categoryListSchema>, tree:  z.infer<typeof categoryListSchema> }) {
    // 1) flat list z propsów (jedno źródło prawdy)

    const router = useRouter()
    const [isSaving, setIsSaving] = React.useState(false)

    const [name, setName] = React.useState("")
    const [sku, setSku] = React.useState("")
    const [slug, setSlug] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [shortDescription, setShortDescription] = React.useState("")
    const [price, setPrice] = React.useState("")        // "99.99"
    const [stockQty, setStockQty] = React.useState("0") // trzymasz jako string w input
    const [isActive, setIsActive] = React.useState(true)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        // 1) walidacje frontowe
        if (!name.trim()) return alert("Podaj nazwę")
        if (!sku.trim()) return alert("Podaj SKU")
        if (!sku.trim()) return alert("Podaj SLUG")
        if (!defaultCategoryId) return alert("Wybierz kategorię domyślną")
        if (!selectedCategoryIds.includes(defaultCategoryId)) {
            // pilnujesz reguły: default musi być w zaznaczonych
            setSelectedCategoryIds((prev) => Array.from(new Set([defaultCategoryId, ...prev])))
        }

        setIsSaving(true)
        try {
            // 2) create product
            const API_URL = process.env.NEXT_PUBLIC_API_URL
            if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL")
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

            const product : ProductRow = await adminApiClient("/admin/products", {
                method: "POST",
                body: JSON.stringify(payload),
            })



            console.log(selectedCategoryIds);
            await adminApiClient(`/admin/products/${product.id}/categories`, {
                method: "POST",
                body: JSON.stringify({ categoryIds: selectedCategoryIds }),
            })

            const files = images.map((i: any) => i.file).filter(Boolean) as File[]
            const token = localStorage.getItem("admin_access_token")
            for (let idx = 0; idx < files.length; idx++) {
                const fd = new FormData()
                fd.append("file", files[idx])

                await adminApiClient(`/admin/products/${product.id}/images`, {
                    method: "POST",
                    body: fd,
                })
            }

            toast.success("Dodano product")
            router.push("/admin/product")
        } catch (err: any) {
            alert(err?.message ?? "Błąd zapisu")
        } finally {
            setIsSaving(false)
        }
    }

    const categoriesFlat = React.useMemo<CategoryFlat[]>(() => {
        return categories.map((c) => ({
            id: c.id,
            name: c.name,
            parentId: c.parentId ?? null, // dopasuj nazwę pola jeśli masz inną
        }))
    }, [categories])


    // 3) selected + default
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([])
    const [defaultCategoryId, setDefaultCategoryId] = React.useState<number | null>(null)

    // 4) select ma pokazywać tylko zaznaczone
    const defaultOptions = React.useMemo(() => {
        const selected = new Set(selectedCategoryIds)
        return categoriesFlat.filter((c) => selected.has(c.id))
    }, [categoriesFlat, selectedCategoryIds])

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

    const [images, setImages] = React.useState<LocalImage[]>([])

    return (
        <form onSubmit={onSubmit}>
            <div className="mx-auto w-full p-4">
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="text-sm font-medium">Dane podstawowe</div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nazwa</Label>
                            <Input id="name" onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Opis</Label>
                            <Textarea id="description" onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="short_description">Podsumowanie</Label>
                            <Textarea id="short_description" onChange={(e) => setShortDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" onChange={(e) => setSku(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">SLUG</Label>
                                <Input id="slug" onChange={(e) => setSlug(e.target.value)} />
                            </div>
                        </div>


                        <ProductImagesInput value={images} onChange={setImages} />

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
                                <Input id="price" inputMode="decimal" placeholder="0" onChange={(e) => setPrice(e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stockQty">Stock</Label>
                                <Input id="stockQty" type="number" min={0} step={1} placeholder="0" onChange={(e) => setStockQty(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                                <div className="text-sm font-medium">Aktywny</div>
                                <div className="text-xs text-muted-foreground">
                                    Wyłączone produkty nie będą widoczne w B2C.
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="mt-5 flex items-center justify-end gap-2">
                    <Button type="submit" disabled={!defaultCategoryId}>
                        Zapisz
                    </Button>
                </CardFooter>
            </div>
        </form>
    )
}