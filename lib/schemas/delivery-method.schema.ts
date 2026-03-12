import { z } from "zod"

export const deliveryMethodSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.string(),
  isActive: z.boolean(),
  position: z.number(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const deliveryMethodListSchema = z.array(deliveryMethodSchema)

export type DeliveryMethodRow = z.infer<typeof deliveryMethodSchema>
