"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Workspace, TabState, ConsoleMessage, AIInsight, CortexFile } from "@/types"
import { workspaceApi, aiApi, consoleApi } from "@/services/api"
import { initialWorkspace } from "@/data/initialData"
import { USER_ID } from "@/config/user"

/**
 * Interface defining the shape of the Cortex context
 */
interface CortexContextType {
  // Workspace state
  workspace: Workspace | null
  isWorkspaceLoading: boolean
  workspaceError: Error | null
  refreshWorkspace: () => Promise<void>

  // Explorer state
  isExplorerOpen: boolean
  toggleExplorer: () => void

  // Tab state
  tabState: TabState
  openTab: (fileId: string) => void
  closeTab: (fileId: string) => void

  // Console state
  consoleMessages: ConsoleMessage[]
  addConsoleMessage: (message: Omit<ConsoleMessage, "id" | "timestamp">) => void
  clearConsole: () => void

  // AI Insights state
  aiInsights: AIInsight[]
  refreshInsights: (fileId?: string) => Promise<void>

  // File operations
  getFileById: (id: string) => CortexFile | undefined
  createFile: (projectId: string, fileData: Partial<CortexFile>) => Promise<CortexFile | null>
  updateFile: (fileId: string, updates: Partial<CortexFile>) => Promise<boolean>
  deleteFile: (fileId: string) => Promise<boolean>
}

/**
 * Create the Cortex context with default values
 */
const CortexContext = createContext<CortexContextType | undefined>(undefined)

/**
 * Provider component for the Cortex context
 */
export function CortexProvider({ children }: { children: React.ReactNode }) {
  // Workspace state
  const [workspace, setWorkspace] = useState<Workspace | null>({
    name: "Loading...",
    projects: [],
  })
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true)
  const [workspaceError, setWorkspaceError] = useState<Error | null>(null)

  // Explorer state
  const [isExplorerOpen, setIsExplorerOpen] = useState(true)

  // Tab state
  const [tabState, setTabState] = useState<TabState>({
    activeTab: "",
    openTabs: [],
  })

  // Console state
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([])

  // AI Insights state
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])

  // Load workspace data from backend
  const loadWorkspace = useCallback(async () => {
    setIsWorkspaceLoading(true)
    setWorkspaceError(null)

    try {
      const data = await workspaceApi.getWorkspace()
      initialWorkspace.projects = data
      setWorkspace(initialWorkspace)

      // Initialize tabs if workspace loaded successfully
      if (data && data.projects && data.projects.length > 0) {
        // Find a dashboard file to open by default
        let dashboardFile: CortexFile | undefined
        let anyFile: CortexFile | undefined

        for (const project of data.projects) {
          for (const file of project.files) {
            if (!anyFile) anyFile = file
            if (file.type === "dashboard") {
              dashboardFile = file
              break
            }
          }
          if (dashboardFile) break
        }

        const defaultFile = dashboardFile || anyFile

        if (defaultFile) {
          setTabState({
            activeTab: defaultFile.id,
            openTabs: [defaultFile.id],
          })
        }
      }

      setIsWorkspaceLoading(false)
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error : new Error("Failed to load workspace"))
      setIsWorkspaceLoading(false)

      // Add error to console
      addConsoleMessage({
        type: "error",
        message: `Error loading workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }, [])

  // Refresh workspace data
  const refreshWorkspace = useCallback(async () => {
    await loadWorkspace()
  }, [loadWorkspace])

  // Toggle explorer visibility
  const toggleExplorer = useCallback(() => {
    setIsExplorerOpen((prev) => !prev)
  }, [])

  // Open a tab
  const openTab = useCallback((fileId: string) => {
    setTabState((prev) => {
      // If tab is already open, just make it active
      if (prev.openTabs.includes(fileId)) {
        return { ...prev, activeTab: fileId }
      }

      // Otherwise, add it to open tabs and make it active
      return {
        activeTab: fileId,
        openTabs: [...prev.openTabs, fileId],
      }
    })
  }, [])

  // Close a tab
  const closeTab = useCallback((fileId: string) => {
    // Check if this is a chat or conversation tab that needs WebSocket cleanup
    if (fileId.startsWith('chat-')) {
      // Extract project name from chat tab ID
      const parts = fileId.split('-')
      const projectName = parts[1]
      const project = workspace?.projects.find((p) => p.name === projectName)
      
      if (project) {
        try {
          // Import dynamically to avoid circular dependencies
          import('@/services/chatService').then(({ cleanupChatConnection }) => {
            // Clean up the WebSocket connection for this chat tab
            cleanupChatConnection(USER_ID, project.id, null)
          })
        } catch (error) {
          console.error('Failed to clean up chat connection:', error)
        }
      }
    } else if (fileId.startsWith('conv-')) {
      // Extract conversation ID and project ID from conversation tab ID
      const parts = fileId.split('-')
      const conversationId = parts[1]
      const projectId = parts[2]
      
      try {
        // Import dynamically to avoid circular dependencies
        import('@/services/chatService').then(({ cleanupChatConnection }) => {
          // Clean up the WebSocket connection for this conversation tab
          cleanupChatConnection(USER_ID, projectId, conversationId)
        })
      } catch (error) {
        console.error('Failed to clean up conversation connection:', error)
      }
    }
    
    setTabState((prev) => {
      // Remove the tab from open tabs
      const newOpenTabs = prev.openTabs.filter((id) => id !== fileId)

      // If we're closing the active tab, make another tab active
      let newActiveTab = prev.activeTab
      if (prev.activeTab === fileId) {
        newActiveTab = newOpenTabs.length > 0 ? newOpenTabs[0] : ""
      }

      return {
        activeTab: newActiveTab,
        openTabs: newOpenTabs,
      }
    })
  }, [workspace])

  // Add a console message
  const addConsoleMessage = useCallback((message: Omit<ConsoleMessage, "id" | "timestamp">) => {
    const newMessage: ConsoleMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    setConsoleMessages((prev) => [...prev, newMessage])
  }, [])

  // Clear the console
  const clearConsole = useCallback(() => {
    setConsoleMessages([])
  }, [])

  // Load console messages from backend
  const loadConsoleMessages = useCallback(async () => {
    try {
      const logs = await consoleApi.getLogs()
      if (logs && Array.isArray(logs)) {
        setConsoleMessages(logs)
      }
    } catch (error) {
      console.error("Failed to load console logs:", error)
    }
  }, [])

  // Refresh AI insights
  const refreshInsights = useCallback(
    async (fileId?: string) => {
      try {
        const insights = await aiApi.getInsights(fileId || "")
        if (insights && Array.isArray(insights)) {
          setAIInsights(insights)
        }
      } catch (error) {
        console.error("Failed to load AI insights:", error)
        addConsoleMessage({
          type: "error",
          message: `Error loading AI insights: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    },
    [addConsoleMessage],
  )

  // Get a file by ID
  const getFileById = useCallback(
    (id: string): CortexFile | undefined => {
      if (!workspace) return undefined

      for (const project of workspace.projects) {
        const file = project.files.find((file) => file.id === id)
        if (file) return file
      }
      return undefined
    },
    [workspace],
  )

  // Create a new file
  const createFile = useCallback(
    async (projectId: string, fileData: Partial<CortexFile>): Promise<CortexFile | null> => {
      try {
        const newFile = await workspaceApi.createFile(projectId, fileData)

        // Update local workspace state
        setWorkspace((prev) => {
          if (!prev) return prev

          return {
            ...prev,
            projects: prev.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  files: [...project.files, newFile],
                }
              }
              return project
            }),
          }
        })

        addConsoleMessage({ type: "info", message: `File "${newFile.name}" created successfully` })
        return newFile
      } catch (error) {
        addConsoleMessage({
          type: "error",
          message: `Error creating file: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
        return null
      }
    },
    [addConsoleMessage],
  )

  // Update a file
  const updateFile = useCallback(
    async (fileId: string, updates: Partial<CortexFile>): Promise<boolean> => {
      try {
        await workspaceApi.saveFile(fileId, updates)

        // Update local workspace state
        setWorkspace((prev) => {
          if (!prev) return prev

          return {
            ...prev,
            projects: prev.projects.map((project) => {
              return {
                ...project,
                files: project.files.map((file) => {
                  if (file.id === fileId) {
                    return { ...file, ...updates }
                  }
                  return file
                }),
              }
            }),
          }
        })

        addConsoleMessage({ type: "info", message: `File updated successfully` })
        return true
      } catch (error) {
        addConsoleMessage({
          type: "error",
          message: `Error updating file: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
        return false
      }
    },
    [addConsoleMessage],
  )

  // Delete a file
  const deleteFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      try {
        await workspaceApi.deleteFile(fileId)

        // Update local workspace state
        setWorkspace((prev) => {
          if (!prev) return prev

          return {
            ...prev,
            projects: prev.projects.map((project) => {
              return {
                ...project,
                files: project.files.filter((file) => file.id !== fileId),
              }
            }),
          }
        })

        // Close the tab if it's open
        closeTab(fileId)

        addConsoleMessage({ type: "info", message: `File deleted successfully` })
        return true
      } catch (error) {
        addConsoleMessage({
          type: "error",
          message: `Error deleting file: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
        return false
      }
    },
    [addConsoleMessage, closeTab],
  )

  // Initialize data on component mount
  useEffect(() => {
    loadWorkspace()
    loadConsoleMessages()
    refreshInsights()
  }, [loadWorkspace, loadConsoleMessages, refreshInsights])

  const value = {
    workspace,
    isWorkspaceLoading,
    workspaceError,
    refreshWorkspace,
    isExplorerOpen,
    toggleExplorer,
    tabState,
    openTab,
    closeTab,
    consoleMessages,
    addConsoleMessage,
    clearConsole,
    aiInsights,
    refreshInsights,
    getFileById,
    createFile,
    updateFile,
    deleteFile,
  }

  return <CortexContext.Provider value={value}>{children}</CortexContext.Provider>
}

/**
 * Custom hook for accessing the Cortex context
 */
export function useCortex() {
  const context = useContext(CortexContext)
  if (context === undefined) {
    throw new Error("useCortex must be used within a CortexProvider")
  }
  return context
}
