"use client"

import * as React from "react"
import { z } from "zod"
import { addressListSchema, addressSchema } from "@/lib/schemas/address.schema"
import { apiClient } from "@/lib/api.client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Address = z.infer<typeof addressSchema>

function emptyAddress(): Partial<Address> {
  return {
    type: "shipping",
    company: "",
    vatId: "",
    street: "",
    city: "",
    postalCode: "",
    countryCode: "PL",
    phone: "",
    isDefault: false,
  }
}

export default function AddressesClient({
  customerId,
  initialAddresses,
}: {
  customerId: number
  initialAddresses: Address[]
}) {
  const [addresses, setAddresses] = React.useState<Address[]>(initialAddresses)
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [editing, setEditing] = React.useState<Address | null>(null)
  const [form, setForm] = React.useState<Partial<Address>>(emptyAddress())
  const [error, setError] = React.useState<string | null>(null)

  function startCreate() {
    setEditing(null)
    setForm(emptyAddress())
    setError(null)
    setOpen(true)
  }

  function startEdit(a: Address) {
    setEditing(a)
    setForm({
      type: a.type,
      company: a.company ?? "",
      vatId: a.vatId ?? "",
      street: a.street,
      city: a.city,
      postalCode: a.postalCode,
      countryCode: a.countryCode,
      phone: a.phone ?? "",
      isDefault: a.isDefault ?? false,
    })
    setError(null)
    setOpen(true)
  }

  async function deleteAddress(a: Address) {
      await apiClient(`/customers/${customerId}/addresses/${a.id}`, {
         method: "DELETE",
      })

      await refresh()
  }

  async function refresh() {
    const next = await apiClient(`/customers/${customerId}/addresses`, {
      method: "GET",
      schema: addressListSchema,
    })
    setAddresses(next)
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      // walidacja minimalna po stronie frontu
      if (!form.street || !form.city || !form.postalCode || !form.countryCode || !form.type) {
        throw new Error("Uzupełnij: ulica, miasto, kod, kraj, typ.")
      }

      if (editing) {
        await apiClient(`/customers/${customerId}/addresses/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            type: form.type,
            company: form.company || null,
            vatId: form.vatId || null,
            street: form.street,
            city: form.city,
            postalCode: form.postalCode,
            countryCode: form.countryCode,
            phone: form.phone || null,
            isDefault: !!form.isDefault,
          }),
        })
      } else {
        await apiClient(`/customers/${customerId}/addresses`, {
          method: "POST",
          body: JSON.stringify({
            type: form.type,
            company: form.company || null,
            vatId: form.vatId || null,
            street: form.street,
            city: form.city,
            postalCode: form.postalCode,
            countryCode: form.countryCode,
            phone: form.phone || null,
            isDefault: !!form.isDefault,
          }),
        })
      }

      await refresh()
      setOpen(false)
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się zapisać adresu.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {addresses.length ? `Liczba adresów: ${addresses.length}` : "Brak adresów"}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
        <Button onClick={startCreate}>Dodaj adres</Button>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edytuj adres" : "Dodaj adres"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              {error && <div className="text-sm text-red-500">{error}</div>}

              <div className="grid gap-2">
                <Label>Typ</Label>
                <Select
                  value={form.type ?? "shipping"}
                  onValueChange={(v) => setForm((s) => ({ ...s, type: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Firma (opcjonalnie)</Label>
                  <Input
                    value={form.company ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>NIP/VAT (opcjonalnie)</Label>
                  <Input
                    value={form.vatId ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, vatId: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Ulica</Label>
                <Input
                  value={form.street ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, street: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2 md:col-span-1">
                  <Label>Kod pocztowy</Label>
                  <Input
                    value={form.postalCode ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, postalCode: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>Miasto</Label>
                  <Input
                    value={form.city ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Kraj</Label>
                  <Input
                    value={form.countryCode ?? "PL"}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, countryCode: e.target.value.toUpperCase() }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Telefon (opcjonalnie)</Label>
                  <Input
                    value={form.phone ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Domyślny</div>
                  <div className="text-xs text-muted-foreground">
                    Ustawi jako domyślny dla wybranego typu.
                  </div>
                </div>
                <Switch
                  checked={!!form.isDefault}
                  onCheckedChange={(v) => setForm((s) => ({ ...s, isDefault: v }))}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Anuluj
              </Button>
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? "Zapis..." : "Zapisz"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {addresses.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium">
                    {a.type === "shipping" ? "Shipping" : "Billing"}
                  </div>
                  {a.isDefault && <Badge variant="secondary">Domyślny</Badge>}
                </div>

                <div className="text-sm text-muted-foreground">
                  {a.company ? `${a.company} · ` : ""}
                  {a.street}, {a.postalCode} {a.city}, {a.countryCode}
                  {a.phone ? ` · ${a.phone}` : ""}
                </div>

                {(a.vatId ?? "").length > 0 && (
                  <div className="text-xs text-muted-foreground">VAT: {a.vatId}</div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => startEdit(a)}>
                  Edytuj
                </Button>
                <Button variant="destructive" onClick={() => deleteAddress(a)}>
                  Usuń
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}