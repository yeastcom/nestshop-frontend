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
    const [customer, setCustomer] = React.useState(cart.customer ?? undefined)
    const [editingCustomer, setEditingCustomer] = React.useState(false)
    const [editingAddress, setEditingAddress] = React.useState(false)

    const hasCustomer = !!cart.customer
    const hasAddress = !!cart.deliveryAddress
    const hasDelivery = !!cart.deliveryMethod

    const [step1, setStep1] = React.useState<StepStatus>(hasCustomer ? "complete" : "current")
    const [step2, setStep2] = React.useState<StepStatus>(!hasCustomer ? "disabled" : hasAddress ? "complete" : "current")
    const [step3, setStep3] = React.useState<StepStatus>(!hasAddress ? "disabled" : hasDelivery ? "complete" : "current")
    const [step4, setStep4] = React.useState<StepStatus>(hasDelivery ? "current" : "disabled")

    console.log(step3);
    console.log(step2);
    console.log(step4);
    
    function handleAddressDone() {
        setEditingAddress(false)
        setStep2("complete")
        setStep3("current")
    }

    function handleDeliveryDone() {
        setStep3("complete")
        setStep4("current")
    }

    return (<>
        <CheckoutStepCustomer
            cart={cart}
            customer={customer}
            status={step1}
            onDone={(c) => { setCustomer(c); setEditingCustomer(false); setStep1("complete"); setStep2("current") }}
            onEdit={() => { setEditingCustomer(true); setStep1("current"); setStep2("disabled"); setStep3("disabled") }}
        />
        <CheckoutStepAddress
            cart={cart}
            customer={customer}
            status={step2}
            onDone={handleAddressDone}
            onEdit={() => { setEditingAddress(true); setStep2("current"); setStep3("disabled") }}
        />
        <CheckoutStepDelivery
            cart={cart}
            status={step3}
            onDone={handleDeliveryDone}
            onEdit={() => { setStep3("current"); setStep4("disabled") }}
        />
        <CheckoutStepPayment
            cart={cart}
            status={step4}
            onDone={(_paymentMethodId) => {
                // TODO: złożenie zamówienia
            }}
        />
    </>)
}