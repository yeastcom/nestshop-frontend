const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

if (!BACKEND_URL) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL in .env.local")
}

export function mediaUrl(path?: string | null) {
  if (!path) return null

  // jeśli backend już zwraca pełny URL
  if (path.startsWith("http://") || path.startsWith("https://")) return path

  // path typu: /media/img/p/1/small_default.jpg
  return `${BACKEND_URL}${path}`
}