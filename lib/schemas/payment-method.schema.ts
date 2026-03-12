import { z } from "zod"

export const paymentMethodSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  position: z.number(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const paymentMethodListSchema = z.array(paymentMethodSchema)

export type PaymentMethodRow = z.infer<typeof paymentMethodSchema>
