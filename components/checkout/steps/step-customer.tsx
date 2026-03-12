"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { customerSchema } from "@/lib/schemas/customer.schema"
import { cartApi } from "@/lib/cart-api"


type StepStatus = "current" | "complete" | "disabled"

const guestFormSchema = z
  .object({
    email: z.email({ message: "Podaj poprawny adres e-mail" }),
    firstName: z.string().min(1, "Imię jest wymagane"),
    lastName: z.string().min(1, "Nazwisko jest wymagane"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password) {
      if (data.password.length < 8) {
        ctx.addIssue({ code: "custom", path: ["password"], message: "Hasło musi mieć min. 8 znaków" })
      }
      if (!/(?=.*[A-Z])(?=.*[0-9])/.test(data.password)) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Hasło musi zawierać wielką literę i cyfrę",
        })
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Hasła nie są zgodne" })
      }
    }
  })

type GuestFormValues = z.infer<typeof guestFormSchema>

function GuestForm({
  onDone,
  existing,
}: {
  onDone: (customer: z.infer<typeof customerSchema>) => void
  existing?: z.infer<typeof customerSchema>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: existing
      ? { email: existing.email, firstName: existing.firstName, lastName: existing.lastName }
      : undefined,
  })

  const [serverError, setServerError] = React.useState<string | null>(null)
  const [wantsAccount, setWantsAccount] = React.useState(false)

  async function onSubmit(data: GuestFormValues) {
    setServerError(null)
    try {
      let customer: z.infer<typeof customerSchema>

      if (existing) {
        const body: Record<string, unknown> = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        }
        if (data.password) {
          body.password = data.password
          body.isGuest = false
        }
        customer = await cartApi<z.infer<typeof customerSchema>>("/auth/me", {
          method: "POST",
          body: JSON.stringify(body),
        })
      } else {
        const body: Record<string, string> = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        }
        if (data.password) body.password = data.password

        customer = await cartApi<z.infer<typeof customerSchema>>("/auth/register", {
          method: "POST",
          body: JSON.stringify(body),
        })
      }

      onDone(customer)
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Wystąpił błąd. Spróbuj ponownie.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="firstName">Imię</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Nazwisko</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="wantsAccount"
          checked={wantsAccount}
          onCheckedChange={(v) => setWantsAccount(!!v)}
        />
        <Label htmlFor="wantsAccount" className="cursor-pointer font-normal">
          Chcę założyć konto
        </Label>
      </div>

      {wantsAccount && (
        <>
          <div className="space-y-1">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" {...register("password")} autoComplete="new-password" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Powtórz hasło</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} autoComplete="new-password" />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Zapisywanie…" : "Kontynuuj"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Link href="/login?redirect=/checkout" className="underline font-medium">
          Zaloguj się
        </Link>
      </p>
    </form>
  )
}

export function LoggedCustomer({ customer }: { customer: z.infer<typeof customerSchema> }) {
  const router = useRouter()

  async function logout() {
    await cartApi("/auth/logout", { method: "POST" })
    router.push("/")
  }

  return (
    <div className="space-y-1">
      <p>
        Zalogowano jako{" "}
        <Link href="/account" className="font-bold underline">
          {customer.firstName} {customer.lastName}
        </Link>
        . To nie ty?{" "}
        <span onClick={logout} className="font-bold underline cursor-pointer">
          Wyloguj się
        </span>
      </p>
      <p className="text-xs text-muted-foreground">Jeśli rozłączysz się teraz, Twój koszyk zostanie opróżniony.</p>
    </div>
  )
}

export function GuestCustomer({ customer, onEdit }: { customer: z.infer<typeof customerSchema>; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm space-y-0.5">
        <p className="font-medium">{customer.firstName} {customer.lastName}</p>
        <p className="text-muted-foreground">{customer.email}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        Zmień
      </Button>
    </div>
  )
}

export function CheckoutStepCustomer({
  customer,
  status,
  onDone,
  onEdit,
}: {
  cart?: z.infer<typeof cartSchema>
  customer?: z.infer<typeof customerSchema>
  status: StepStatus
  onDone: (customer: z.infer<typeof customerSchema>) => void
  onEdit: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane klienta</CardTitle>
        {status === "complete" && customer && (
          <CardDescription>
            {customer.isGuest
              ? <GuestCustomer customer={customer} onEdit={onEdit} />
              : <LoggedCustomer customer={customer} />
            }
          </CardDescription>
        )}
      </CardHeader>

      {status === "current" && (
        <CardContent>
          <GuestForm onDone={onDone} existing={customer?.isGuest ? customer : undefined} />
        </CardContent>
      )}
    </Card>
  )
}
