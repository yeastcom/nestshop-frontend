"use client"

import { z } from "zod"
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
import { customerSchema } from "@/lib/schemas/customer.schema"

export  function AccountForm({ customer }: { customer: z.infer<typeof customerSchema>}) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const [firstName, setFirstName] = React.useState(customer.firstName)
  const [lastName, setLastName] = React.useState(customer.lastName)
  const [email, setEmail] = React.useState(customer.email);
  const [password, setPassword] = React.useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = {
        email,
        password,
        firstName,
        lastName
      }

     await apiClient(`/customers/${customer.id}`, {
        method: "PUT",
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


      <form onSubmit={onSubmit}>

          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="firstname">Imię</Label>
              <Input
                id="firstname"
                name="firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastname">Nazwisko</Label>
              <Input
                value={lastName}
                onChange={(e) => setFirstName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={password}  onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>



          <Button type="submit" className="w-full mt-5" disabled={loading}>
            {loading ? "Zapisywanie" : "Zapisz"}
          </Button>

      </form>

  )
}