"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResizableSidebarProps {
  children: ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  position?: "left" | "right"
  onWidthChange?: (width: number) => void
  onDoubleClick?: () => void
}

const ResizableSidebar = ({
  children,
  defaultWidth = 240,
  minWidth = 200,
  maxWidth = 600,
  position = "left",
  onWidthChange,
  onDoubleClick,
}: ResizableSidebarProps) => {
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const handleResize = useCallback(
    (newWidth: number) => {
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
        onWidthChange?.(newWidth)
      }
    },
    [minWidth, maxWidth, onWidthChange],
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const sidebar = sidebarRef.current
      if (!sidebar) return

      const rect = sidebar.getBoundingClientRect()
      const newWidth = position === "left" ? e.clientX - rect.left : rect.right - e.clientX

      handleResize(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleResize, position])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDoubleClickLocal = () => {
    onDoubleClick?.()
  }

  return (
    <div className="relative flex-shrink-0 overflow-hidden" style={{ width: width }} ref={sidebarRef}>
      {children}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-px cursor-col-resize z-10",
          "bg-border hover:bg-primary/50",
          position === "right" ? "-left-px" : "-right-px",
        )}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClickLocal}
      >
        {isDragging && <div className="fixed inset-0 bg-background/5 z-50 pointer-events-none" />}
      </div>
    </div>
  )
}

export { ResizableSidebar }

