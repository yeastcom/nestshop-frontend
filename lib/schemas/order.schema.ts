import { z } from "zod"

export const orderItemSchema = z.object({
    id: z.number(),
    productId: z.number(),
    name: z.string(),
    sku: z.string().nullable().optional(),
    qty: z.number(),
    unitPrice: z.string(),
    lineTotal: z.string(),
})

const deliveryAddressSchema = z.object({
    fullName: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    street: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    countryCode: z.string().nullable().optional(),
})

export const orderSchema = z.object({
    id: z.number(),
    orderNumber: z.string(),
    itemsTotal: z.string(),
    shippingTotal: z.string().optional(),
    statusCode: z.string(),
    total: z.string(),
    customerId: z.number(),
    currency: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deliveryAddress: deliveryAddressSchema,
    invoiceAddress: deliveryAddressSchema.nullable().optional(),
    items: z.array(orderItemSchema).optional(),
    paymentMethod: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    deliveryMethod: z.object({ id: z.number(), name: z.string(), price: z.string() }).nullable().optional(),
})

export const orderListSchema = z.array(orderSchema)

export type OrderRow = z.infer<typeof orderSchema>
export type OrderListRow = z.infer<typeof orderListSchema>