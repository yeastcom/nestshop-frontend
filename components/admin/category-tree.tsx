"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type CategoryNode = {
  id: number
  name: string
  children?: CategoryNode[]
}

type Props = {
  categories: CategoryNode[]
  value: number[]      
  multiple: boolean
  onChange: (next: number[]) => void
  className?: string
}

export function CategoryTree({ categories, value, onChange, className, multiple = true }: Props) {
  const selected = React.useMemo(() => new Set(value), [value])

  function toggle(id: number) {
    if (multiple){
        const next = new Set(selected)
        if (next.has(id)) next.delete(id)
        else next.add(id)
       
        onChange(Array.from(next))
    } else {
        const last = new Set(selected);

        if (last.has(id)) {
            last.delete(id);
            onChange(Array.from(last))
        } else {
            const next = new Set([id])
            onChange(Array.from(next))
        }
    }
    
  }

  return (
    <div className={cn("rounded-md border p-3", className)}>
      <div className="text-sm font-medium mb-2">Kategorie</div>
      <div className="space-y-1">
        {categories.map((node) => (
          <Node key={node.id} node={node} level={0} selected={selected} onToggle={toggle} />
        ))}
      </div>
    </div>
  )
}

function Node({
  node,
  level,
  selected,
  onToggle,
}: {
  node: CategoryNode
  level: number
  selected: Set<number>
  onToggle: (id: number) => void
}) {
  const checked = selected.has(node.id)

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <Checkbox checked={checked} onCheckedChange={() => onToggle(node.id)} />
        <span className="text-sm">{node.name}</span>
      </div>

      {node.children?.length ? (
        <div className="space-y-1">
          {node.children.map((child) => (
            <Node
              key={child.id}
              node={child}
              level={level + 1}
              selected={selected}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}