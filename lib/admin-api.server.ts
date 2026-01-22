import { cookies } from "next/headers"
import { z } from "zod"

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL")

type ApiOptions<T> = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>
  schema?: z.ZodType<T>
}

export async function adminApiServer<T>(
  path: string,
  options: ApiOptions<T> = {},
): Promise<T> {
  const cookieHeader = (await cookies()).toString()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader, // <-- klucz przy sesji
      ...(options.headers ?? {}),
    },
    cache: "no-store",
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }

  const json: unknown = await res.json()
  if (options.schema) return options.schema.parse(json)
  return json as T
}