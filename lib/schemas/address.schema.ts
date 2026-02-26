// src/lib/schemas/address.schema.ts
import { z } from "zod"
export const addressTypeSchema = z.enum(["shipping", "billing"])

export const customerSchemaAddress = z.object({
  id: z.number(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})


export const addressSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  customer: customerSchemaAddress.optional(),
  type: addressTypeSchema,
  company: z.string().nullable().optional(),
  vatId: z.string().nullable().optional(),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  countryCode: z.string(),
  phone: z.string().nullable().optional(),
  isDefault: z.boolean(),
})

export const addressListSchema = z.array(addressSchema)

export type AddressRow = z.infer<typeof addressSchema>
export type AddressListRow = z.infer<typeof addressListSchema>