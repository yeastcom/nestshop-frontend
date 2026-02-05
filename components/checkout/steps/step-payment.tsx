"use client"


import { z } from "zod"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { customerSchema } from "@/lib/schemas/customer.schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
type StepStatus = "current" | "complete" | "disabled"


export default function CheckoutStepPayment({status, cart, customer}: {status: StepStatus, cart: z.infer<typeof cartSchema>, customer?: z.infer<typeof customerSchema> } ) {
    let description: React.ReactNode = null
      if (status == "disabled") {
          description = "Wybierz metodę dostawy."
      } else if (status === "current") {
            description = "Metody płatności zobaczysz po wybraniu metody dostawy."
      }
    return (
    <Card className="mt-5 mb-5">
      <CardHeader>
        <CardTitle>Metody płatności</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}