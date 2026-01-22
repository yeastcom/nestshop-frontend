export type CategoryFlat = {
  id: number
  name: string
  parentId: number | null
}

export type CategoryNode = {
  id: number
  name: string
  children: CategoryNode[]
}

export function buildCategoryTree(list: CategoryFlat[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>()

  for (const c of list) {
    byId.set(c.id, { id: c.id, name: c.name, children: [] })
  }

  const roots: CategoryNode[] = []

  for (const c of list) {
    const node = byId.get(c.id)!
    if (c.parentId != null && byId.has(c.parentId)) {
      byId.get(c.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // sort opcjonalnie
  const sortRec = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => sortRec(n.children))
  }
  sortRec(roots)

  return roots
}