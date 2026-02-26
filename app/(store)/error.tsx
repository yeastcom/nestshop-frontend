"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function StoreError({
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
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-2xl font-semibold">Coś poszło nie tak</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.
      </p>
      <Button onClick={reset}>Spróbuj ponownie</Button>
    </div>
  )
}
