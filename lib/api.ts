// src/lib/api.ts
type ApiErrorBody = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export class ApiError extends Error {
  status: number
  body?: ApiErrorBody

  constructor(status: number, body?: ApiErrorBody) {
    super(
      typeof body?.message === "string"
        ? body.message
        : Array.isArray(body?.message)
          ? body.message.join(", ")
          : body?.error || `HTTP ${status}`,
    )
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL in .env.local")
}

// MVP: token w localStorage (docelowo lepiej httpOnly cookie)
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("admin_access_token")
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return
  if (!token) localStorage.removeItem("admin_access_token")
  else localStorage.setItem("admin_access_token", token)
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  auth?: boolean // domyślnie true
}

export async function api<T>(
  path: string,
  { body, auth = true, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const token = auth ? getAccessToken() : null

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let parsed: ApiErrorBody | undefined
    try {
      parsed = await res.json()
    } catch {
      // ignore
    }

    // opcjonalnie: auto-logout na 401
    if (res.status === 401 && typeof window !== "undefined") {
      setAccessToken(null)
      // tu możesz zrobić redirect do /admin/login jeśli chcesz
      // window.location.href = "/admin/login"
    }

    throw new ApiError(res.status, parsed)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  // zwykle JSON
  return (await res.json()) as T
}