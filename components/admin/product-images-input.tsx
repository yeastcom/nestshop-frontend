"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export type LocalImage = {
  id: string
  file: File
  previewUrl: string
  cover: boolean
  position: number
}

type Props = {
  value: LocalImage[]
  onChange: (next: LocalImage[]) => void
}

function makeId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(16)
    .slice(2)}`
}

function normalize(next: LocalImage[]) {
  let out = next
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((x, idx) => ({ ...x, position: idx }))

  if (out.length && !out.some((i) => i.cover)) {
    out = out.map((i, idx) => ({ ...i, cover: idx === 0 }))
  }
  return out
}

export function ProductImagesInput({ value, onChange }: Props) {
  const [isDragOver, setIsDragOver] = React.useState(false)

  // sprzątanie blob URLs przy unmount
  React.useEffect(() => {
    return () => {
      value.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addFilesFromList(files: FileList | null) {
    if (!files?.length) return
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!incoming.length) return

    const startPos = value.length
    const mapped: LocalImage[] = incoming.map((file, idx) => ({
      id: makeId(file),
      file,
      previewUrl: URL.createObjectURL(file),
      cover: false,
      position: startPos + idx,
    }))

    onChange(normalize([...value, ...mapped]))
  }

  function removeImage(id: string) {
    const removed = value.find((x) => x.id === id)
    if (removed) URL.revokeObjectURL(removed.previewUrl)
    onChange(normalize(value.filter((x) => x.id !== id)))
  }

  function setCover(id: string) {
    onChange(
      normalize(
        value.map((x) => ({
          ...x,
          cover: x.id === id,
        })),
      ),
    )
  }

  function moveImage(id: string, dir: -1 | 1) {
    const idx = value.findIndex((x) => x.id === id)
    if (idx === -1) return
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= value.length) return

    const next = [...value]
    ;[next[idx], next[nextIdx]] = [next[nextIdx], next[idx]]
    onChange(normalize(next))
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

      {value.length === 0 ? (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          Brak zdjęć.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {value
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((img) => (
              <div key={img.id} className="group relative rounded-md border p-2">
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {img.cover && (
                  <div className="mt-2 rounded bg-primary px-2 py-1 text-center text-[11px] text-primary-foreground">
                    COVER
                  </div>
                )}

                <div className="mt-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant={img.cover ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCover(img.id)}
                  >
                    Ustaw jako cover
                  </Button>

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