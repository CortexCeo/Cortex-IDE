"use client"

import { useState } from "react"
import { aiApi } from "@/services/api"
import { useCortex } from "@/context/CortexContext"

/**
 * Custom hook for AI processing with backend integration
 */
export function useAIProcessing() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { addConsoleMessage } = useCortex()

  // Process code with AI
  const processCode = async (code: string, action: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      addConsoleMessage({ type: "info", message: `Processing code with AI (${action})...` })
      const result = await aiApi.processCode(code, action)
      setIsProcessing(false)
      addConsoleMessage({ type: "info", message: "AI processing complete" })
      return result.processedCode
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to process code with AI"))
      setIsProcessing(false)
      addConsoleMessage({
        type: "error",
        message: `Error in AI processing: ${err instanceof Error ? err.message : "Unknown error"}`,
      })
      return null
    }
  }

  // Process markdown with AI
  const processMarkdown = async (markdown: string, action: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      addConsoleMessage({ type: "info", message: `Processing markdown with AI (${action})...` })
      const result = await aiApi.processMarkdown(markdown, action)
      setIsProcessing(false)
      addConsoleMessage({ type: "info", message: "AI processing complete" })
      return result.processedMarkdown
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to process markdown with AI"))
      setIsProcessing(false)
      addConsoleMessage({
        type: "error",
        message: `Error in AI processing: ${err instanceof Error ? err.message : "Unknown error"}`,
      })
      return null
    }
  }

  return {
    isProcessing,
    error,
    processCode,
    processMarkdown,
  }
}

