"use client"

import { toast } from "sonner"
import { z } from "zod"
import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { adminApiClient } from "@/lib/admin-api.client"
import { cmsSchema } from "@/lib/schemas/cms.schema"
import { RichTextEditor } from "@/components/RichTextEditor"


export default function CmsForm({ cms }: {cms?: z.infer<typeof cmsSchema> }) {
    const router = useRouter()
    const [isSaving, setIsSaving] = React.useState(false)

    const [title, setTitle] = React.useState(cms ? cms.title : "")
    const [slug, setSlug] = React.useState(cms ? cms.slug : "")
    const [content, setContent] = React.useState<string>(cms?.content ?? "")
    const [isActive, setIsActive] = React.useState(cms ? cms.isActive : false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        // 1) walidacje frontowe
        if (!title.trim()) return alert("Podaj nazwę")
        if (!slug.trim()) return alert("Podaj SLUG")

        setIsSaving(true)
        try {
            const payload = {
                title,
                content,
                isActive,
                slug
            };

            if (cms) {
                await adminApiClient(`/admin/cms/${cms.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                })
                toast.success(`Zaaktualizowano stronę CMS #${cms.id}`)
                router.push("/admin/cms")
            } else {
                await adminApiClient("/admin/cms", {
                    method: "POST",
                    body: JSON.stringify(payload),
                })

                toast.success("Dodano stronę CMS")
                router.push("/admin/cms")
            }
        } catch (err: any) {
            alert(err?.message ?? "Błąd zapisu")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={onSubmit}>


     

            <div className="mx-auto w-full p-4">
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                            <Label htmlFor="name">Tytuł</Label>
                            <Input id="name" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">SLUG</Label>
                                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Treść</Label>
                             <RichTextEditor  value={content} onChange={setContent} />
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