import { notFound, redirect } from "next/navigation"
import { apiServer } from "@/lib/api.server"
import { cmsSchema } from "@/lib/schemas/cms.schema"

export default async function Page({ params }: { params: { idSlug: string } }) {


const { idSlug } = await params
    const idAndSlug = idSlug.match(/^(\d+)-(.+)$/);
    
    if (!idAndSlug) {
        notFound()
    }
    const id = idAndSlug[1]
    const slug = idAndSlug[2]


  const cms = await apiServer(`/cms/${id}`, { method: "GET", schema: cmsSchema })

  if (cms.slug && cms.slug != slug) {
    redirect(`/content/${cms.id}-${cms.slug}`)
  }
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold">{cms.title}</h1>

      {/* jeśli content to HTML */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: cms.content }}
      />
    </div>
  )
}