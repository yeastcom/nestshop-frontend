import Link from "next/link"
import { apiServer } from "@/lib/api.server"
import { cmsListSchema } from "@/lib/schemas/cms.schema"


export default async function Page() {
  const pages = await apiServer("/cms", { method: "GET", schema: cmsListSchema })

   function cmsUrl(cms: { id: number; slug: string }) {
    return `/content/${cms.id}-${cms.slug}`
  }


  return (
    <div className="container mx-auto px-4 py-8 ">
      <h1 className="text-2xl font-semibold mb-5">Treści</h1>

    
        {pages.map((p, i) => (
          <Link
            key={p.id}
            href={cmsUrl(p)}
            className="block px-4 py-3 hover:bg-muted"
          >
            <div className="font-medium">{i+1}. {p.title}</div>
          </Link>
        ))}
    
    </div>
  )
}