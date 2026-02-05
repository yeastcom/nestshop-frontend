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
import { menuSchema, menuListSchema } from "@/lib/schemas/menu.schema"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


export default function MenuForm({ menuItems, menu }: {menuItems: z.infer<typeof menuListSchema>, menu?: z.infer<typeof menuSchema> }) {
    const router = useRouter()
    const [isSaving, setIsSaving] = React.useState(false)
    const [name, setName] = React.useState(menu ? menu.name : "")
    const [url, setUrl] = React.useState(menu ? menu.url : "")
    const [parentId, setParentId] = React.useState(menu?.parentId ?? null)
    const [position, setPosition] = React.useState(menu?.position ?? "0")
    const [isActive, setIsActive] = React.useState(menu ? menu.isActive : false)


    const currentParent = menuItems.find((item => item.id === parentId))

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        // 1) walidacje frontowe
        if (!name.trim()) return alert("Podaj nazwę")

        setIsSaving(true)
        try {
            const payload = {
                name,
                url,
                isActive,
                parentId,
                position
            };


            if (menu) {
                await adminApiClient(`/admin/menu/${menu.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                })
                toast.success(`Zaaktualizowano stronę menu #${menu.id}`)
                router.push("/admin/menu")
            } else {
                await adminApiClient("/admin/menu", {
                    method: "POST",
                    body: JSON.stringify(payload),
                })

                toast.success("Dodano stronę menu")
                router.push("/admin/menu")
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
                            <Label htmlFor="name">Nazwa</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">Url</Label>
                                <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="position">Pozycja</Label>
                                <Input id="position" type="number" min="0" value={position} onChange={(e) => setPosition(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                 <Label htmlFor="menu">Nadrzędny element</Label>
                                <Select
                                    value={parentId}
                                    onValueChange={(v) => setParentId(Number(v))}
                                >
                                    <SelectTrigger>
                                        {currentParent ? (
                                            <span>{currentParent.name}</span>
                                        ) : (
                                            <SelectValue
                                                placeholder={"Nadrzenny element"}
                                            />
                                        )}
                                    </SelectTrigger>

                                    <SelectContent>
                                        {menuItems.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                      
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                                <div className="text-sm font-medium">Aktywny</div>
                                <div className="text-xs text-muted-foreground">
                                    Wyłączony elemenut nie będą widoczne w B2C.
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