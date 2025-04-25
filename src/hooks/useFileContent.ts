"use client"

import { useState, useEffect } from "react"
import { workspaceApi } from "@/services/api"
import { useCortex } from "@/context/CortexContext"

/**
 * Custom hook for managing file content with backend integration
 */
export function useFileContent(fileId: string) {
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { addConsoleMessage } = useCortex()

  // Load file content from backend
  useEffect(() => {
    let isMounted = true

    async function loadContent() {
      if (!fileId) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await workspaceApi.getFile(fileId)
        if (isMounted) {
          setContent(data.content)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load file content"))
          setIsLoading(false)
          addConsoleMessage({
            type: "error",
            message: `Error loading file: ${err instanceof Error ? err.message : "Unknown error"}`,
          })
        }
      }
    }

    loadContent()

    return () => {
      isMounted = false
    }
  }, [fileId, addConsoleMessage])

  // Save file content to backend
  const saveContent = async (newContent: any) => {
    if (!fileId) return

    setIsSaving(true)
    setError(null)

    try {
      await workspaceApi.saveFile(fileId, newContent)
      setContent(newContent)
      setIsSaving(false)
      addConsoleMessage({ type: "info", message: "File saved successfully" })
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to save file content"))
      setIsSaving(false)
      addConsoleMessage({
        type: "error",
        message: `Error saving file: ${err instanceof Error ? err.message : "Unknown error"}`,
      })
      return false
    }
  }

  return {
    content,
    setContent,
    isLoading,
    error,
    isSaving,
    saveContent,
  }
}

