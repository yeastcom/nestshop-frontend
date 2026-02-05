"use client"

import * as React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../ui/button"
import { IconMenu2, IconChevronDown } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"

import { menuListSchema } from "@/lib/schemas/menu.schema"
import { z } from "zod"

export function Menu({ menu }: { menu: z.infer<typeof menuListSchema> }) {
  return (
    <>
      {/* MOBILE */}
      <div className="md:hidden mt-2">
        <MobileMenu menu={menu} />
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopMenu menu={menu} />
      </div>
    </>
  )
}


function DesktopMenu({ menu }: { menu: z.infer<typeof menuListSchema> }) {
   return (
    <NavigationMenu>
      <NavigationMenuList>
        {menu.map((menuItem) => (
        <NavigationMenuItem key={menuItem.id}>
          
          {menuItem.children.length ?
          <>
          <NavigationMenuTrigger><Link href={menuItem.url}>{menuItem.name}</Link></NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-96 grid grid-cols-1 gap-4 md:grid-cols-2">
                {menuItem.children.map((item) => (<ListItem className="grid gap-2" key={item.id} href={item.url} title={item.name}/>
         ))}
    
            </ul>
          </NavigationMenuContent></>
           : <NavigationMenuLink  href={menuItem.url}className={navigationMenuTriggerStyle()}>
            {menuItem.name}
          </NavigationMenuLink>
        }
        </NavigationMenuItem>
       
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function MobileMenu({ menu }: { menu: z.infer<typeof menuListSchema> }) {
  const [open, setOpen] = React.useState(false)
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({})

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
       
          <IconMenu2 />
      
      </SheetTrigger>

      <SheetContent side="left" className="w-[320px] sm:w-[360px] p-0">
        <SheetHeader className="p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <Separator />

        <nav className="p-2">
          <ul className="space-y-1">
            {menu.map((m) => {
              const hasChildren = !!m.children?.length
              const isOpen = !!expanded[m.id]

              return (
                <li key={m.id} className="rounded-md">
                  <div className="flex items-center justify-between">
                    <Link
                      href={m.url}
                      className="flex-1 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                      onClick={() => setOpen(false)}
                    >
                      {m.name}
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        className="px-3 py-2 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setExpanded((s) => ({ ...s, [m.id]: !s[m.id] }))
                        }
                        aria-label="Rozwiń"
                      >
                        <IconChevronDown
                          className={`transition ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && isOpen && (
                    <ul className="ml-3 mt-1 space-y-1 border-l pl-3">
                      {m.children.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.url}
                            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setOpen(false)}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink href={href}>
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            <div className="text-muted-foreground line-clamp-2">{children}</div>
          </div>
   
      </NavigationMenuLink>
    </li>
  )
}