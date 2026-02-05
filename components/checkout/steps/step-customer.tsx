"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import Link from "next/link"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { customerSchema } from "@/lib/schemas/customer.schema"


type StepStatus = "current" | "complete" | "disabled"

export function LoggedCustomer({customer}: {customer: z.infer<typeof customerSchema>}) {
  async function logout() {
    console.log("Log out");
  } 
  console.log(customer)
  return (<div>
    Zalogowano jako <Link href="/account" className="font-bold underline">{customer.firstName} {customer.lastName}</Link>. To nie ty? <span onClick={logout}className="font-bold underline cursor-pointer">Wyloguj się</span>
    <p>Jeśli rozłączysz się teraz, Twój koszyk zostanie opróżniony.</p>
  </div>)
}

export function CheckoutStepCustomer({
  cart,
  customer,
  status
}: {
  cart: z.infer<typeof cartSchema>,
  customer?: z.infer<typeof customerSchema>
  status: StepStatus
}) {


    let description: React.ReactNode = null
  if (status == "complete" && customer) {
      description = (<LoggedCustomer customer={customer}/>)
  } else {
   
  }




  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane klienta</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>


    </Card>
  )
}