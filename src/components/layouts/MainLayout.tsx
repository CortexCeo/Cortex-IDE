"use client"

import type { ReactNode } from "react"
import { IconSidebar } from "@/components/sidebar/IconSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CortexProvider } from "@/context/CortexContext"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <CortexProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
          <IconSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </SidebarProvider>
    </CortexProvider>
  )
}

