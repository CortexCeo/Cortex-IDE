"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Code, ChevronDown, Wand2, Zap, FileCode, Braces, Bug, GitMerge, Layers } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useCortex } from "@/context/CortexContext"
import { useFileContent } from "@/hooks/useFileContent"
import { useAIProcessing } from "@/hooks/useAIProcessing"

interface PythonContentProps {
  fileId: string
}

/**
 * PythonContent component - Displays Python code editor with backend integration
 */
export function PythonContent({ fileId }: PythonContentProps) {
  // Get file content using our custom hook
  const { content, setContent, isLoading, error, saveContent } = useFileContent(fileId)

  // Get AI processing functionality
  const { isProcessing, processCode } = useAIProcessing()

  // Local state
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState("")
  const { addConsoleMessage } = useCortex()

  // Update local content when content from API changes
  useEffect(() => {
    if (content) {
      setLocalContent(content)
    }
  }, [content])

  // Toggle edit mode
  const toggleEditMode = async () => {
    // If we're exiting edit mode, save the content
    if (isEditing) {
      const success = await saveContent(localContent)
      if (success) {
        addConsoleMessage({ type: "info", message: "Python code saved successfully" })
      }
    }
    setIsEditing(!isEditing)
  }

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value)
  }

  // AI improvement functions
  const applyAIImprovement = async (action: string) => {
    if (!content) return

    try {
      const processedCode = await processCode(localContent || content, action)
      if (processedCode) {
        setLocalContent(processedCode)
        // If we're not in edit mode, save immediately
        if (!isEditing) {
          await saveContent(processedCode)
        }
      }
    } catch (error) {
      addConsoleMessage({
        type: "error",
        message: `Error applying AI improvement: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500">Error loading Python content: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1 overflow-auto relative">
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {isEditing ? (
            <Button size="sm" variant="outline" onClick={toggleEditMode} className="h-8 text-xs">
              <Code className="h-3.5 w-3.5 mr-1.5" />
              Preview
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={toggleEditMode} className="h-8 text-xs">
                <FileCode className="h-3.5 w-3.5 mr-1.5" />
                Edit Code
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="h-8 text-xs" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <div className="h-3.5 w-3.5 mr-1.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                        Improve Code
                        <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>AI Code Improvements</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => applyAIImprovement("optimize")}>
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Optimize performance</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyAIImprovement("comments")}>
                    <FileCode className="h-4 w-4 mr-2" />
                    <span>Add detailed comments</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyAIImprovement("types")}>
                    <Braces className="h-4 w-4 mr-2" />
                    <span>Add type hints</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => applyAIImprovement("debug")}>
                    <Bug className="h-4 w-4 mr-2" />
                    <span>Add debugging code</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyAIImprovement("oop")}>
                    <Layers className="h-4 w-4 mr-2" />
                    <span>Convert to OOP style</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyAIImprovement("functional")}>
                    <GitMerge className="h-4 w-4 mr-2" />
                    <span>Convert to functional style</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {isEditing ? (
          <div className="p-4">
            <textarea
              value={localContent}
              onChange={handleContentChange}
              className="w-full h-[calc(100vh-180px)] p-4 border border-border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              spellCheck="false"
            />
          </div>
        ) : (
          <div className="p-4 font-mono text-sm">
            <pre className="text-foreground p-4 rounded-md overflow-auto border border-border">
              <code>{localContent}</code>
            </pre>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

