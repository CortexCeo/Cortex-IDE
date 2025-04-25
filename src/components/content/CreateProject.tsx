"use client"

import { useState } from "react"
import { useCortex } from "@/context/CortexContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { USER_ID } from "@/config/user"

interface CreateProjectDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface CreateProjectButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  onSuccess?: () => void
  buttonType?: "default" | "icon-only"
  iconClassName?: string
}

/**
 * CreateProjectButton component - Button that opens the create project dialog
 */
export function CreateProjectButton({ 
  variant = "default", 
  size = "default", 
  className, 
  onSuccess,
  buttonType = "default",
  iconClassName = "h-4 w-4"
}: CreateProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      {buttonType === "default" ? (
        <Button 
          variant={variant} 
          size={size} 
          className={cn("flex items-center gap-2", className)}
          onClick={() => setIsOpen(true)}
        >
          <Plus className={iconClassName} />
          Create Project
        </Button>
      ) : (
        <Button
          variant={variant}
          size="icon"
          className={cn("h-6 w-6 ml-auto opacity-50 group-hover:opacity-100 transition-opacity", className)}
          onClick={(e) => {
            if (e.stopPropagation) e.stopPropagation()
            setIsOpen(true)
          }}
        >
          <Plus className={iconClassName} />
        </Button>
      )}
      
      <CreateProjectDialog 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
        onSuccess={onSuccess} 
      />
    </>
  )
}

/**
 * CreateProjectDialog component - Dialog for creating a new project
 */
export function CreateProjectDialog({ isOpen, onOpenChange, onSuccess }: CreateProjectDialogProps) {
  const { refreshWorkspace } = useCortex()
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError("Project name cannot be empty")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Call the API to create a new project
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID, // get this from auth context
          name: projectName,
          description: '', // Optional description
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error creating project:", errorData)
        throw new Error(errorData.error || 'Failed to create project')
      }
      
      // After successful creation, refresh the workspace
      await refreshWorkspace()
      
      // Close the dialog and reset form
      onOpenChange(false)
      setProjectName("")
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      // Type guard to check if err is an Error object
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === 'object' && err !== null && 'error' in err) {
        // Handle case where err is an object with an error property
        setError((err as { error: string }).error)
      } else {
        // Default error message
        setError('Failed to create project. Please try again.')
      }
      console.error("Error creating project:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter a name for your new project. This will add a new project to your workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-name" className="text-right">
              Project Name
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
              placeholder="Project Alpha"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-500 col-span-4 text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleCreateProject}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
