"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, ChevronDown, Wand2, Scissors, Maximize2, Check, BookOpen, Languages, Sparkles } from "lucide-react"
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

interface MarkdownContentProps {
  fileId: string
}

/**
 * MarkdownContent component - Displays Markdown content with backend integration
 */
export function MarkdownContent({ fileId }: MarkdownContentProps) {
  // Get file content using our custom hook
  const { content, setContent, isLoading, error, saveContent } = useFileContent(fileId)

  // Get AI processing functionality
  const { isProcessing, processMarkdown } = useAIProcessing()

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
        addConsoleMessage({ type: "info", message: "Markdown content saved successfully" })
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
      const processedMarkdown = await processMarkdown(localContent || content, action)
      if (processedMarkdown) {
        setLocalContent(processedMarkdown)
        // If we're not in edit mode, save immediately
        if (!isEditing) {
          await saveContent(processedMarkdown)
        }
      }
    } catch (error) {
      addConsoleMessage({
        type: "error",
        message: `Error applying AI improvement: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  // Simple markdown renderer (very basic implementation)
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n")
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-bold mb-4">
            {line.substring(2)}
          </h1>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl font-semibold mb-3">
            {line.substring(3)}
          </h2>
        )
      }

      // Lists
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 mb-2">
            {line.substring(2)}
          </li>
        )
      }
      if (line.match(/^\d+\. /)) {
        const content = line.replace(/^\d+\. /, "")
        return (
          <li key={index} className="ml-6 list-decimal mb-2">
            {content}
          </li>
        )
      }

      // Empty line
      if (line.trim() === "") {
        return <br key={index} />
      }

      // Regular paragraph
      return (
        <p key={index} className="mb-4">
          {line}
        </p>
      )
    })
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
        <div className="text-red-500">Error loading Markdown content: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1 overflow-auto relative">
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {isEditing ? (
            <Button size="sm" variant="outline" onClick={toggleEditMode} className="h-8 text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Preview
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={toggleEditMode} className="h-8 text-xs">
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
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
                        Improve
                        <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>AI Improvements</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => applyAIImprovement("correct")}>
                    <Check className="h-4 w-4 mr-2" />
                    <span>Fix errors & typos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyAIImprovement("shorten")}>
                    <Scissors className="h-4 w-4 mr-2" />
                    <span>Make it shorter</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyAIImprovement("lengthen")}>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    <span>Make it longer</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => applyAIImprovement("formal")}>
                    <Languages className="h-4 w-4 mr-2" />
                    <span>More formal tone</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyAIImprovement("simple")}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Simplify language</span>
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
              placeholder="Enter markdown content here..."
            />
          </div>
        ) : (
          <div className="p-4">{renderMarkdown(localContent)}</div>
        )}
      </ScrollArea>
    </div>
  )
}

