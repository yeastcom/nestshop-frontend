"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { apiClient } from "@/lib/api.client"
import { useRouter } from "next/navigation"

export  function LoginForm() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const form = new FormData(e.currentTarget)
      const email = String(form.get("email") || "")
      const password = String(form.get("password") || "")

     await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      router.push("/account")
    } catch (err: any) {
      setError(err?.message ?? "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="m-auto mt-40 w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center">Logowanie</CardTitle>

      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2 mt-5">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logowanie" : "Zaloguj się"}
          </Button>
          <Link href="/account/register" className="w-full">
            <Button type="button" variant="outline" className="w-full" >
                Nie mam konta
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}