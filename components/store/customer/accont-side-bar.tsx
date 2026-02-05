"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconUserFilled, IconLogout, IconAddressBook, IconBasketCheck } from "@tabler/icons-react"
import { apiClient } from "@/lib/api.client"
import { useRouter } from "next/navigation"

export default function AccountSideBar() {
    const router = useRouter()

    async function logout() {
        await apiClient("/auth/logout", { method: "POST"})

        router.push("/account/login")
    }

  return (
        <aside className="rounded-lg border p-4">
          <nav className="grid gap-2">
            <Link href="/account" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <IconUserFilled/> Moje konto
              </Button>
            </Link>

            <Link href="/account/addresses" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <IconAddressBook/> Adresy
              </Button>
            </Link>

            <Link href="/account/orders" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <IconBasketCheck/> Zamówienia
              </Button>
            </Link>

    
            <Button variant="destructive" className="w-full justify-start" onClick={() => logout()} type="submit">
            <IconLogout/> Wyloguj
            </Button>
      
          </nav>
        </aside>
  )
}