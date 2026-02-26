"use client"

import { toast } from "sonner"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { imageListSchema } from "@/lib/schemas/image.schema"
import { z } from "zod"
import { adminApiClient } from "@/lib/admin-api.client"

export type ProductImage = {
  id: string
  originalId?: number
  file?: File
  previewUrl: string
  cover: boolean
  position: number
  productId?: number
}

type Props = {
  value: ProductImage[]
  savedImages: z.infer<typeof imageListSchema>
  onChange: (next: ProductImage[]) => void
}

function makeId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(16)
    .slice(2)}`
}

function normalize(next: ProductImage[]) {
  let out = next
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((x, idx) => ({ ...x, position: idx }))

  if (out.length && !out.some((i) => i.cover)) {
    out = out.map((i, idx) => ({ ...i, cover: idx === 0 }))
  }
  return out
}

export function ProductImagesInput({ value, savedImages, onChange }: Props) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [images, setImages] = React.useState<ProductImage[]>(value)
  const imagesRef = React.useRef(images)

  React.useEffect(() => {
    imagesRef.current = images
  }, [images])

  // sprzątanie blob URLs przy unmount (tylko nowe pliki, nie zapisane)
  React.useEffect(() => {
    return () => {
      imagesRef.current
        .filter((img) => img.file)
        .forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [])



  function addFilesFromList(files: FileList | null) {
    if (!files?.length) return
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!incoming.length) return

    const startPos = value.length
    const mapped: ProductImage[] = incoming.map((file, idx) => ({
      id: makeId(file),
      file,
      previewUrl: URL.createObjectURL(file),
      cover: false,
      position: startPos + idx,
    }))

    onChange(normalize([...value, ...mapped]))

    setImages(normalize([...value, ...mapped]))
  }

  async function removeImage(id: string) {
    const image = value.find((x) => x.id === id)
    
    if (image?.originalId) {
        await adminApiClient(`/admin/products/${image.productId}/images/${image.originalId}`, {
            method: "DELETE",
        })

        toast.success("Usunięto zdjęcie")
    }

    const removed = value.find((x) => x.id === id)
    if (removed) URL.revokeObjectURL(removed.previewUrl)
    onChange(normalize(value.filter((x) => x.id !== id)))

    const temp = normalize(value.filter((x) => x.id !== id));
    setImages(temp)
  }

  async function setCover(id: string) {
    const image = value.find((x) => x.id === id)
    
    if (image?.originalId) {
        await adminApiClient(`/admin/products/${image.productId}/images/${image.originalId}/cover`, {
            method: "PATCH",
        })

        toast.success("Zaaktualizowano cover")
    }

    let temp = normalize(
      value.map((x) => ({
        ...x,
        cover: x.id === id,
      })),
    );
    onChange(temp)

    setImages(temp)
  }

  function moveImage(id: string, dir: -1 | 1) {

    const idx = value.findIndex((x) => x.id === id)

    if (idx === -1) return
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= value.length) return

    const next = [...value]
    const tempPosition = next[idx].position;

    next[idx].position = next[nextIdx].position
    next[nextIdx].position = tempPosition;
    ;[next[idx], next[nextIdx]] = [next[nextIdx], next[idx]]
    onChange(normalize(next))

    setImages(next)
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    addFilesFromList(files)
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragOver) setIsDragOver(true)
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Dropzone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "rounded-md border border-dashed p-4 transition",
          isDragOver ? "bg-muted" : "bg-transparent",
        ].join(" ")}
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">Przeciągnij zdjęcia tutaj</div>
          <div className="text-xs text-muted-foreground">
            albo wybierz pliki ręcznie (JPG/PNG/WebP).
          </div>

          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFilesFromList(e.target.files)}
          />
        </div>
      </div>

      {images.length === 0 && savedImages.length == 0 ? (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          Brak zdjęć.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">

          {images
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((img) => (
              <div key={img.id} className="group relative rounded-md border p-2">
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {img.cover == true ? (
                      <div
                      style={{fontSize: "14px", padding: "5px", marginBottom: "1px"}}
                        className="rounded bg-primary px-2 text-center text-[11px] text-primary-foreground"
                      >
                        COVER
                      </div>
                  ): <Button
                    type="button"
                    variant={img.cover ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCover(img.id)}
                  >
                    Ustaw jako cover
                  </Button>}




                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => moveImage(img.id, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => moveImage(img.id, 1)}
                    >
                      ↓
                    </Button>
                  </div>
                </div>

                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-md bg-background/80 p-1 opacity-0 shadow-sm transition group-hover:opacity-100"
                  onClick={() => removeImage(img.id)}
                  aria-label="Usuń zdjęcie"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}