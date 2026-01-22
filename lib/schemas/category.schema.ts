import { z } from "zod"

export const categorySchema: z.ZodType<CategoryDto> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    isActive: z.boolean(),
    parentId: z.number().nullable().optional(),
    children: z.array(categorySchema).default([]),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
)

export type CategoryDto = {
  id: number
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  parentId?: number | null
  children: CategoryDto[]
  createdAt?: string
  updatedAt?: string
}

export type CategoryRow = z.infer<typeof categorySchema>
export const categoryListSchema = z.array(categorySchema)