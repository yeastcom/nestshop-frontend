import { z } from "zod"
import { categorySchema, categoryListSchema } from "./category.schema"
import { imageSchema } from "./image.schema"

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  slug: z.string(),

  description: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),

  price: z.string(),
  isActive: z.boolean(),
  stockQty: z.number(),

  defaultCategoryId: z.number(),
  defaultCategory: categorySchema.optional(),

  categories: categoryListSchema.optional(),

  images: z.array(imageSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const productListSchema = z.array(productSchema)

export const categoryProductSchema = z.object({
  items: productListSchema,
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number()
})

export type ProductRow = z.infer<typeof productSchema>
export type ProductListRow = z.infer<typeof productListSchema>