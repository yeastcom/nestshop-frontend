"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-semibold">Błąd panelu administracyjnego</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Wystąpił nieoczekiwany błąd. Sprawdź konsolę lub spróbuj ponownie.
      </p>
      <Button onClick={reset}>Spróbuj ponownie</Button>
    </div>
  )
}
