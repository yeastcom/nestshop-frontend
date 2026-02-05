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

export  function RegisterForm() {
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
      const firstName = String(form.get("firstname") || "")
      const lastName =  String(form.get("lastname") || "")

      const payload = {
        email,
        password,
        firstName,
        lastName
      }

     await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      router.push("/account")
    } catch (err: any) {
      setError(err?.message ?? "Register failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="m-auto mt-40 w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center">Rejestracja</CardTitle>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="firstname">Imię</Label>
              <Input
                id="firstname"
                name="firstname"
                type="text"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastname">Nazwisko</Label>
              <Input
                id="lastname"
                name="lastname"
                type="lastname"
                required
              />
            </div>
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
            {loading ? "Rejestracja" : "Zarejestruj się"}
          </Button>
          <Link href="/account/login" className="w-full">
            <Button type="button" variant="outline" className="w-full" >
                Mam konto
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}