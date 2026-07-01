import { useRef, useState } from 'react'

/** HTML5 drag-and-drop list reordering hook */
export function useDragSort<T>(initial: T[]) {
  const [items, setItems] = useState<T[]>(initial)
  const dragFrom = useRef<number | null>(null)
  const dragTo = useRef<number | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  function dragHandlers(index: number) {
    return {
      draggable: true as const,
      onDragStart(e: React.DragEvent) {
        dragFrom.current = index
        setDraggingIndex(index)
        e.dataTransfer.effectAllowed = 'move'
      },
      onDragEnter() {
        dragTo.current = index
        setOverIndex(index)
      },
      onDragOver(e: React.DragEvent) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      },
      onDrop(e: React.DragEvent) {
        e.preventDefault()
        if (dragFrom.current === null || dragFrom.current === dragTo.current) return
        const next = [...items]
        const [removed] = next.splice(dragFrom.current, 1)
        next.splice(dragTo.current ?? index, 0, removed)
        setItems(next)
        dragFrom.current = null
        dragTo.current = null
        setDraggingIndex(null)
        setOverIndex(null)
      },
      onDragEnd() {
        dragFrom.current = null
        dragTo.current = null
        setDraggingIndex(null)
        setOverIndex(null)
      },
    }
  }

  function dragSourceHandlers(index: number) {
    return {
      draggable: true as const,
      onDragStart(e: React.DragEvent) {
        dragFrom.current = index
        setDraggingIndex(index)
        e.dataTransfer.effectAllowed = 'move'
      },
      onDragEnd() {
        dragFrom.current = null
        dragTo.current = null
        setDraggingIndex(null)
        setOverIndex(null)
      },
    }
  }

  function dragTargetHandlers(index: number) {
    return {
      onDragEnter() {
        dragTo.current = index
        setOverIndex(index)
      },
      onDragOver(e: React.DragEvent) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      },
      onDrop(e: React.DragEvent) {
        e.preventDefault()
        if (dragFrom.current === null || dragFrom.current === dragTo.current) return
        const next = [...items]
        const [removed] = next.splice(dragFrom.current, 1)
        next.splice(dragTo.current ?? index, 0, removed)
        setItems(next)
        dragFrom.current = null
        dragTo.current = null
        setDraggingIndex(null)
        setOverIndex(null)
      },
    }
  }

  return { items, setItems, dragHandlers, dragSourceHandlers, dragTargetHandlers, draggingIndex, overIndex }
}
