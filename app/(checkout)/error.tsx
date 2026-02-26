"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutError({
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
      <h2 className="text-2xl font-semibold">Błąd podczas realizacji zamówienia</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Wystąpił błąd podczas przetwarzania zamówienia. Twój koszyk jest nienaruszony.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/cart">Wróć do koszyka</Link>
        </Button>
        <Button onClick={reset}>Spróbuj ponownie</Button>
      </div>
    </div>
  )
}
