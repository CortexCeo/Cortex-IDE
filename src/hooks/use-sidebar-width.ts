"use client"

import { useState, useEffect } from "react"

type SidebarPosition = "left" | "right"

export function useSidebarWidth(position: SidebarPosition = "right", defaultWidth = 320) {
  // Use a unique key for each sidebar position
  const storageKey = `mastero-sidebar-width-${position}`

  // Initialize with default or stored value
  const [width, setWidth] = useState<number>(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = Number.parseInt(stored, 10)
        if (!isNaN(parsed)) return parsed
      }
    }
    return defaultWidth
  })

  // Update stored value when width changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, width.toString())
    }
  }, [width, storageKey])

  return [width, setWidth] as const
}

