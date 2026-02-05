"use client"

import { z } from "zod"
import { cartSchema } from "@/lib/schemas/cart.schema"
import { CheckoutStepCustomer } from "./steps/step-customer"
import * as React from "react"
import CheckoutStepAddress from "./steps/step-address"
import CheckoutStepDelivery from "./steps/step-delivery"
import CheckoutStepPayment from "./steps/step-payment"


type StepStatus = "current" | "complete" | "disabled"

export default function CheckoutSteps({cart} : {cart: z.infer<typeof cartSchema>}) {
    const [customer, setCustomer] = React.useState(cart.customer)
     const [step1, setStep1] = React.useState<StepStatus>("disabled")
    const [step2, setStep2] = React.useState<StepStatus>("disabled")
    const [step3, setStep3] = React.useState<StepStatus>("disabled")
    const [step4, setStep4] = React.useState<StepStatus>("disabled")

    React.useEffect(() => {
        setStep1(customer ? "complete" : "current")
        setStep2(customer ? "current" : "disabled")
    }, [customer])
    console.log(customer)
   

    return (<>
        <CheckoutStepCustomer cart={cart} customer={customer} status={step1} />
        <CheckoutStepAddress cart={cart} customer={customer}  status={step2}/>
        <CheckoutStepDelivery cart={cart} customer={customer}  status={step2}/>
        <CheckoutStepPayment cart={cart} customer={customer}  status={step2}/>
    </>)
}