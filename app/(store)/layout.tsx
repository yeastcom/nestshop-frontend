import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/components/store/cart/cart-context";
import { apiServer } from "@/lib/api.server";
import { cartSchema } from "@/lib/schemas/cart.schema";
import { Header } from "@/components/store/header";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NestShop",
  description: "Created by Michał Drożdżyński",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cart = await apiServer("/cart", { method: "GET", schema: cartSchema })

  return (
    <html lang="en" className={inter.variable}>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <CartProvider initialCart={cart}>
          <Header cart={cart}/>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
