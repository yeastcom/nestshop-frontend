"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  IconCircleCheckFilled,
  IconDotsVertical,
  IconPlus,
  IconXboxXFilled,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { paymentMethodSchema, type PaymentMethodRow } from "@/lib/schemas/payment-method.schema"
import { adminApiClient } from "@/lib/admin-api.client"

const formSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  description: z.string().optional(),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof formSchema>

function PaymentMethodForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<FormValues>
  onSave: (values: FormValues) => Promise<void>
  onCancel: () => void
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      position: initial?.position ?? 0,
      isActive: initial?.isActive ?? true,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Nazwa</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Opis (opcjonalnie)</Label>
          <Input {...register("description")} />
        </div>
        <div className="space-y-1">
          <Label>Pozycja</Label>
          <Input type="number" {...register("position")} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch
            checked={watch("isActive")}
            onCheckedChange={(v) => setValue("isActive", v)}
          />
          <Label>Aktywna</Label>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Anuluj</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Zapisywanie…" : "Zapisz"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function PaymentMethodDataTable({ data: initialData }: { data: PaymentMethodRow[] }) {
  const [data, setData] = React.useState(initialData)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<PaymentMethodRow | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(row: PaymentMethodRow) {
    setEditing(row)
    setDialogOpen(true)
  }

  async function handleSave(values: FormValues) {
    if (editing) {
      const updated = await adminApiClient<PaymentMethodRow>(`/admin/payment-methods/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      })
      setData((prev) => prev.map((d) => d.id === updated.id ? updated : d))
      toast.success("Zaktualizowano metodę płatności")
    } else {
      const created = await adminApiClient<PaymentMethodRow>(`/admin/payment-methods`, {
        method: "POST",
        body: JSON.stringify(values),
      })
      setData((prev) => [...prev, created])
      toast.success("Dodano metodę płatności")
    }
    setDialogOpen(false)
  }

  async function handleDelete(id: number) {
    await adminApiClient(`/admin/payment-methods/${id}`, { method: "DELETE" })
    setData((prev) => prev.filter((d) => d.id !== id))
    toast.success(`Usunięto metodę #${id}`)
  }

  async function handleToggleActive(row: PaymentMethodRow) {
    const updated = await adminApiClient<PaymentMethodRow>(`/admin/payment-methods/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !row.isActive }),
    })
    setData((prev) => prev.map((d) => d.id === updated.id ? updated : d))
  }

  const columns: ColumnDef<PaymentMethodRow>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.original.id,
    },
    {
      accessorKey: "position",
      header: "Poz.",
      cell: ({ row }) => row.original.position,
    },
    {
      accessorKey: "name",
      header: "Nazwa",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-muted-foreground text-xs">{row.original.description}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="cursor-pointer px-1.5"
          onClick={() => handleToggleActive(row.original)}
        >
          {row.original.isActive ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
          ) : (
            <IconXboxXFilled className="fill-red-500 dark:fill-red-400" />
          )}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="text-muted-foreground flex size-8 items-center justify-center rounded-md hover:bg-muted cursor-pointer">
              <IconDotsVertical />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>Edytuj</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(row.original.id)}>
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {data.length} metod(-y) płatności
        </h2>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <IconPlus />
          Dodaj metodę
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Brak metod płatności. Dodaj pierwszą.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edytuj metodę płatności" : "Dodaj metodę płatności"}</DialogTitle>
          </DialogHeader>
          <PaymentMethodForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
