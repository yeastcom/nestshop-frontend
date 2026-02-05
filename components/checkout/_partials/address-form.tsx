"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const addressFormSchema = z.object({
  type: z.enum(["shipping", "billing"]),
  company: z.string().optional().nullable(),
  vatId: z.string().optional().nullable(),
  street: z.string().min(1, "Ulica jest wymagana"),
  city: z.string().min(1, "Miasto jest wymagane"),
  postalCode: z.string().min(1, "Kod pocztowy jest wymagany"),
  countryCode: z
    .string()
    .min(2, "Kod kraju jest wymagany")
    .max(2, "Kod kraju ma mieć 2 znaki"),
  phone: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
})

export type AddressFormValues = z.infer<typeof addressFormSchema>

export function AddressForm({
  type,
  initialValues,
  onSubmit,
  submitLabel = "Zapisz adres",
  disabled = false,
}: {
  type: "shipping" | "billing"
  initialValues?: Partial<AddressFormValues>
  onSubmit: (values: AddressFormValues) => Promise<void> | void
  submitLabel?: string
  disabled?: boolean
}) {
  const [saving, setSaving] = React.useState(false)

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      type,
      company: "",
      vatId: "",
      street: "",
      city: "",
      postalCode: "",
      countryCode: "PL",
      phone: "",
      isDefault: false,
      ...initialValues,
      type, // wymuszamy
    },
    mode: "onSubmit",
  })

  async function handleSubmit(values: AddressFormValues) {
    setSaving(true)
    try {
      // normalizacja
      const payload: AddressFormValues = {
        ...values,
        company: values.company?.trim() ? values.company.trim() : null,
        vatId: values.vatId?.trim() ? values.vatId.trim() : null,
        phone: values.phone?.trim() ? values.phone.trim() : null,
        countryCode: values.countryCode.trim().toUpperCase(),
      }
      await onSubmit(payload)
      form.reset({ ...payload, isDefault: payload.isDefault ?? false })
    } finally {
      setSaving(false)
    }
  }

  const {
    register,
    formState: { errors },
    handleSubmit: rhfHandleSubmit,
    watch,
    setValue,
  } = form

  const currentType = watch("type")

  const isBilling = currentType === "billing"

  return (
    <form onSubmit={rhfHandleSubmit(handleSubmit)} className="space-y-4">
      <input type="hidden" value={type} {...register("type")} />

      {/* Dane adresowe */}
      <div className="grid gap-2">
        <Label htmlFor="street">Ulica i nr</Label>
        <Input id="street" disabled={disabled || saving} {...register("street")} />
        {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2 md:col-span-1">
          <Label htmlFor="postalCode">Kod pocztowy</Label>
          <Input
            id="postalCode"
            disabled={disabled || saving}
            placeholder="00-001"
            {...register("postalCode")}
          />
          {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode.message}</p>}
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="city">Miasto</Label>
          <Input id="city" disabled={disabled || saving} {...register("city")} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="countryCode">Kraj</Label>
          <Input
            id="countryCode"
            disabled={disabled || saving}
            placeholder="PL"
            maxLength={2}
            {...register("countryCode")}
            onChange={(e) => {
              setValue("countryCode", e.target.value.toUpperCase())
            }}
          />
          {errors.countryCode && (
            <p className="text-sm text-red-500">{errors.countryCode.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Telefon (opcjonalnie)</Label>
          <Input id="phone" disabled={disabled || saving} {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Dane do faktury tylko jeśli billing */}
      {isBilling && (
        <div className="space-y-4 rounded-md border p-4">
          <div className="text-sm font-medium">Dane do faktury</div>

          <div className="grid gap-2">
            <Label htmlFor="company">Firma (opcjonalnie)</Label>
            <Input id="company" disabled={disabled || saving} {...register("company")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vatId">NIP (opcjonalnie)</Label>
            <Input
              id="vatId"
              disabled={disabled || saving}
              placeholder="PL1234567890"
              {...register("vatId")}
            />
          </div>
        </div>
      )}


      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || saving}>
          {saving ? "Zapisywanie..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}