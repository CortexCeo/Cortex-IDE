"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarNavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isCollapsed?: boolean
  onClick?: () => void
  className?: string
}

/**
 * SidebarNavItem - A reusable navigation item for the sidebar
 * Styled to emulate Notion's sidebar items
 *
 * @param href - The destination URL
 * @param icon - The icon to display
 * @param label - The text label
 * @param isCollapsed - Whether the sidebar is collapsed
 * @param onClick - Optional click handler (if navigation should be handled programmatically)
 * @param className - Additional CSS classes
 */
export function SidebarNavItem({ href, icon, label, isCollapsed = false, onClick, className }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} className="w-full" onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
          "hover:bg-gray-200 hover:text-foreground",
          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          isCollapsed ? "justify-center" : "justify-start",
          className,
        )}
      >
        <div className={cn("flex items-center justify-center", isCollapsed ? "w-6 h-6" : "w-5 h-5 min-w-5")}>
          {icon}
        </div>
        {!isCollapsed && <span className="truncate">{label}</span>}
        {isCollapsed && <span className="sr-only">{label}</span>}
      </div>
    </Link>
  )
}

