import { z } from "zod"
import { productSchema } from "./product.schema"

import { customerSchema } from "./customer.schema"

export const cartItemSchema = z.object({
    id: z.number(),
    cartId: z.number(),
    unitPrice: z.string(),
    qty: z.number(),
    productId: z.number(),
    product: productSchema,
})

export const cartItemListSchema = z.array(cartItemSchema)

export const cartSchema = z.object({
    id: z.number(),
    token: z.string(),
    customerId: z.number().nullable(),
    customer: customerSchema.optional(),
    status: z.string(),
    items: cartItemListSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
})

