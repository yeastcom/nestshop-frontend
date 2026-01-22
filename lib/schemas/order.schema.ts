import { z } from "zod"

export const orderSchema = z.object({
    id: z.number(),
    orderNumber: z.string(),
    itemsTotal: z.string(),
    statusCode: z.string(),
    total: z.string(),
    customerId: z.number(),
    currency: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    deliveryAddress: z.json(),
    invoiceAddress: z.json()
})

export const orderListSchema = z.array(orderSchema)

export type OrderRow = z.infer<typeof orderSchema>
export type OrderListRow = z.infer<typeof orderListSchema>