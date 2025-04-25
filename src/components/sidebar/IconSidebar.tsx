"use client"

import { useState, useEffect } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarNavItem } from "./SidebarNavItem"
import { navigationConfig } from "@/config/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain } from "lucide-react"

interface IconSidebarProps {
  onToggleTemplateSpace?: () => void
  onToggleDeepResearch?: () => void
  onToggleZoneResearch?: () => void
  isExplorerOpenProp?: boolean
  toggleExplorerProp?: () => void
}

export function IconSidebar({
  onToggleTemplateSpace,
  onToggleDeepResearch,
  onToggleZoneResearch,
  isExplorerOpenProp,
  toggleExplorerProp,
}: IconSidebarProps) {
  // Persist collapsed state in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Update localStorage when collapse state changes
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newState))
    }
  }

  // Handle navigation item clicks without affecting collapse state
  const handleNavItemClick = (key: string) => {
    console.log("Inside handleNavItemClick", key)
    switch (key) {
      case "explorer":
        toggleExplorerProp?.()
        break
      case "templates":
        onToggleTemplateSpace?.()
        break
      case "deep-research":
        onToggleDeepResearch?.()
        break
      case "zone-research":
        onToggleZoneResearch?.()
        break
      default:
        // Default behavior is handled by the Link component
        break
    }
  }

  // Handle window resize for responsive behavior
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768 && !isCollapsed) {
        setIsCollapsed(true)
        localStorage.setItem("sidebarCollapsed", JSON.stringify(true))
      }
    }

    window.addEventListener("resize", checkSize)
    checkSize() // Check on initial load

    return () => window.removeEventListener("resize", checkSize)
  }, [isCollapsed])

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={`flex flex-col h-full border-r border-border/40 bg-background/95 backdrop-blur-sm transition-all duration-300 ${
          isCollapsed ? "w-[60px]" : "w-[200px]"
        }`}
      >
        {/* Workspace header */}
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm truncate">Cortex</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-7 h-7 mx-auto rounded-md bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg" onClick={toggleSidebar}>
              <Brain className="h-6 w-6" />
            </div>
          )}
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleSidebar}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main navigation items - categorized */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {navigationConfig.categories.map((category) => (
            <div key={category.id} className="mb-4">
              {/* Category heading - only show when expanded */}
              {!isCollapsed && (
                <h3 className="text-xs font-medium text-muted-foreground px-2 mb-1">{category.label}</h3>
              )}

              {/* Category divider - only show when collapsed */}
              {isCollapsed && category.id !== "workspace" && <div className="h-px bg-border/40 my-2 mx-1"></div>}

              {/* Category items */}
              <div className="space-y-1">
                {category.items.map((item) => (
                  <Tooltip key={item.key}>
                    <TooltipTrigger asChild>
                      <div>
                        <SidebarNavItem
                          href={item.path}
                          icon={item.icon}
                          label={item.label}
                          isCollapsed={isCollapsed}
                          onClick={() => handleNavItemClick(item.key)}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn(!isCollapsed && "hidden")}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom navigation items (settings, etc.) */}
        <div className="border-t border-border/40 p-2">
          <div className="space-y-1 mb-2">
            {!isCollapsed && <h3 className="text-xs font-medium text-muted-foreground px-2 mb-1">System</h3>}
            {navigationConfig.bottomItems.map((item) => (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>
                  <div>
                    <SidebarNavItem href={item.path} icon={item.icon} label={item.label} isCollapsed={isCollapsed} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className={cn(!isCollapsed && "hidden")}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* User profile */}
          <div
            className={cn(
              "mt-4 flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors",
              isCollapsed ? "justify-center" : "justify-start",
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {!isCollapsed && <span className="text-sm font-medium truncate">John Doe</span>}
          </div>

          {/* Collapse button - only show on mobile or when sidebar is expanded */}
          {isCollapsed && !isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-8 mt-2 flex items-center justify-center"
              onClick={toggleSidebar}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

// Helper function to conditionally join class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ")
}

