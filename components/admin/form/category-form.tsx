"use client"

import { toast } from "sonner"
import { z } from "zod"
import * as React from "react"
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
import { buildCategoryTree, type CategoryFlat } from "@/lib/categories"
import { useRouter } from "next/navigation"
import { adminApiClient } from "@/lib/admin-api.client"
import { ProductRow } from "@/lib/schemas/product.schema"
import { categoryListSchema, categorySchema } from "@/lib/schemas/category.schema"

export default function CategoryForm({ tree, category }: {tree: z.infer<typeof categoryListSchema> , category?: z.infer<typeof categorySchema> }) {
    // 1) flat list z propsów (jedno źródło prawdy)
    console.log(tree)
    const router = useRouter()
    const [isSaving, setIsSaving] = React.useState(false)

    const [name, setName] = React.useState(category ? category.name : "")
    const [slug, setSlug] = React.useState(category ? category.slug : "")
    const [description, setDescription] = React.useState<string>(category?.description ?? "")
    const [isActive, setIsActive] = React.useState(category ? category.isActive : false)
    const [parentId, setParentId] = React.useState<number[]>(category && category.parentId ? [category.parentId] : [])
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        // 1) walidacje frontowe
        if (!name.trim()) return alert("Podaj nazwę")
        if (!slug.trim()) return alert("Podaj SLUG")

        setIsSaving(true)
        try {
            // 2) create product
            const API_URL = process.env.NEXT_PUBLIC_API_URL
            if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL")
            const payload = {
                name,
                description,
                isActive,
                slug,
                parentId: parentId.at(-1) ?? null
            };

            if (category) {
                await adminApiClient(`/admin/categories/${category.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                })
                toast.success(`Zaaktualizowano kategorię #${category.id}`)
            } else {
                await adminApiClient("/admin/categories", {
                    method: "POST",
                    body: JSON.stringify(payload),
                })
                toast.success("Dodano kategorię")
                router.push("/admin/category")
            }
        } catch (err: any) {
            alert(err?.message ?? "Błąd zapisu")
        } finally {
            setIsSaving(false)
        }
    }


    // 3) selected + default
    


    return (
        <form onSubmit={onSubmit}>
            <div className="mx-auto w-full p-4">
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="text-sm font-medium">Dane podstawowe</div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                            <Label htmlFor="name">Nazwa</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">SLUG</Label>
                                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Opis</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Kategoria nadrzenna(drzewko)</Label>
                                <CategoryTree
                                    categories={tree} // <-- tu MUSI być drzewko
                                    value={parentId}
                                    onChange={setParentId}
                                    multiple={false}
                                />
    
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                                <div className="text-sm font-medium">Aktywny</div>
                                <div className="text-xs text-muted-foreground">
                                    Wyłączone produkty nie będą widoczne w B2C.
                                </div>
                            </div>
                            <Switch  checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="mt-5 flex items-center justify-end gap-2">
                    <Button type="submit">
                        Zapisz
                    </Button>
                </CardFooter>
            </div>
        </form>
    )
}