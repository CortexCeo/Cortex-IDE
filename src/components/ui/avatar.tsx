"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { UserMemoryPanel } from "../user-memory-panel"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => {
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(false)

  return (
    <>
      <AvatarPrimitive.Image
        ref={ref}
        className={cn(
          "aspect-square h-full w-full cursor-pointer transition-all duration-300",
          "hover:opacity-90 hover:scale-105 hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:z-10",
          "hover:shadow-[0_0_8px_rgba(var(--primary-rgb)/0.3)]",
          className,
        )}
        onClick={() => setIsMemoryPanelOpen(true)}
        src={props.src || "/placeholder.svg?height=40&width=40"}
        alt={props.alt || "User avatar"}
        {...props}
      />
      <UserMemoryPanel isOpen={isMemoryPanelOpen} onClose={() => setIsMemoryPanelOpen(false)} />
    </>
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

