import { Menu } from "@/components/store/menu";
import { z } from "zod"

import { apiServer } from "@/lib/api.server";
import { ShoppingCart } from "@/components/store/shopping-cart";
import { menuListSchema } from "@/lib/schemas/menu.schema";
import { cartSchema } from "@/lib/schemas/cart.schema";
import { IconUserFilled } from "@tabler/icons-react";
import Link from "next/link";

export async function Header({cart}: {cart: z.infer<typeof cartSchema>,}) {
    const menu = await apiServer("/menu", {
        method: "GET",
        schema: menuListSchema
      });

      console.log(cart)

    return (
        <div className="mt-5 mx-auto container grid grid-cols-2 px-4 md:px-0">
            <div className="grid gap-2">
                <Menu menu={menu}/>
            </div>
            <div className="grid gap-2 justify-self-end mt-2">
                <div className="grid grid-cols-2">
                    <Link href={"account"}><IconUserFilled size={30} /></Link>
                    
                    <ShoppingCart initialCart={cart}/>
                </div>
                
            </div>
        </div>
    )
}