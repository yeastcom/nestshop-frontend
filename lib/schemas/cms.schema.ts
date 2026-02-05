import { z } from "zod"

export const cmsSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const cmsListSchema = z.array(cmsSchema)

export type CmsRow = z.infer<typeof cmsSchema>
export type CmsListRow = z.infer<typeof cmsListSchema>