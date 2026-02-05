import { z } from "zod"

export const adminAuthSchema = z.object({
  id: z.number(),
  email: z.string().email(),
})
