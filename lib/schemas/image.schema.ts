import { z } from "zod"

export const imageUrlSchema = z.object({
  original: z.string(),
  cart_default: z.string(),
  small_default: z.string(),
  medium_default: z.string(),
  home_default: z.string(),
})

export const imageSchema = z.object({
  cover: z.boolean(),
  id: z.number(),
  position: z.number(),
  productId: z.number(),
  urls: imageUrlSchema,
})

export type ImagesRow = z.infer<typeof imageSchema>