import { z } from "zod"

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL")

type ApiOptions<T> = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>
  schema?: z.ZodType<T>
}

export async function apiClient<T>(
  path: string,
  options: ApiOptions<T> = {},
): Promise<T> {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
   headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }

  if (res.status === 204) return undefined as T


  const json: unknown = await res.json()
  if (options.schema) return options.schema.parse(json)
  return json as T
}