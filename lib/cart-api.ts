const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL")

type ApiOptions = Omit<RequestInit, "headers"> & { headers?: Record<string, string> }

export async function cartApi<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // <- KLUCZOWE dla cart_token cookie
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }

  // jeśli kiedyś zrobisz 204:
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}