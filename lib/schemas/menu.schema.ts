import { z } from "zod"

export const menuSchema: z.ZodType<MenuDto> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    url: z.string(),
    position: z.number(),
    isActive: z.boolean(),
    parentId: z.number().nullable().optional(),
    parent: menuSchema.optional(),
    children: z.array(menuSchema).default([]),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
)

export type MenuDto = {
  id: number
  name: string
  url: string
  position: number
  isActive: boolean
  parentId?: number | null
  parent?: MenuDto
  children: MenuDto[]
  createdAt?: string
  updatedAt?: string
}

export type MenuRow = z.infer<typeof menuSchema>
export const menuListSchema = z.array(menuSchema)