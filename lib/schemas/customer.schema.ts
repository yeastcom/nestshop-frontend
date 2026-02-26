import { z } from "zod"

import { addressListSchema } from "./address.schema"
export const customerSchema = z.object({
  id: z.number(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  isActive: z.boolean(),
  addresses: addressListSchema.optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})




export const customerListSchema = z.array(customerSchema)

export type CustomerRow = z.infer<typeof customerSchema>
export type CustomerListRow = z.infer<typeof customerListSchema>