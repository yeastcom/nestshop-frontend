"use client"


import { z } from "zod"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { customerSchema } from "@/lib/schemas/customer.schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
type StepStatus = "current" | "complete" | "disabled"


export default function CheckoutStepDelivery({status, cart, customer}: {status: StepStatus, cart: z.infer<typeof cartSchema>, customer?: z.infer<typeof customerSchema> } ) {

    return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Metody dostawy</CardTitle>
        <CardDescription>
          Metody dostawy zobaczysz po wypełnieniu danych odbiorcy przesyłki.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}