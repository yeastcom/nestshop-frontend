import AccountSideBar from "@/components/store/customer/account-side-bar"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <AccountSideBar/>
        <main className="rounded-lg border p-6">{children}</main>
      </div>
    </div>
  )
}