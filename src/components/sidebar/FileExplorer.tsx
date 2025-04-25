"use client"
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  PenSquare,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useCortex } from "@/context/CortexContext"
import { FileItem } from "./FileItem"
import { ChatItem } from "./ChatItem"
import type { Project } from "@/types"
import { useState, useEffect } from "react"
import { CreateProjectButton } from "../content/CreateProject"
import { deleteConversation } from "@/services/chatService"

/**
 * FileExplorer component - Displays the file explorer sidebar
 */
export function FileExplorer() {
  const { workspace, isExplorerOpen, toggleExplorer, openTab, addConsoleMessage, refreshWorkspace, tabState, closeTab } = useCortex()
  // const [searchQuery, setSearchQuery] = useState("")
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})

  // Function to handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // Show a message that we're deleting the conversation
      addConsoleMessage({
        type: "info",
        message: `Deleting conversation: ${conversationId}...`
      })
      
      // Call the API to delete the conversation
      const response = await deleteConversation(conversationId)
      
      // Log success and refresh workspace to update the UI
      console.log('Conversation deleted:', response)
      addConsoleMessage({
        type: "info",
        message: `Conversation deleted successfully`
      })
      
      // Refresh the workspace to update the UI
      await refreshWorkspace()
      
      // Close the tab if it was open
      const tabId = `conv-${conversationId}`
      if (tabState.openTabs.some((tab: string) => tab.startsWith(tabId))) {
        closeTab(tabId)
      }
    } catch (error) {
      // Handle any errors
      console.error('Error deleting conversation:', error)
      addConsoleMessage({
        type: "error",
        message: `Error deleting conversation: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  // Initialize expanded projects state when workspace loads
  useEffect(() => {
    if (workspace) {
      const initialState: Record<string, boolean> = {}
      workspace.projects.forEach((project) => {
        initialState[project.id] = true
      })
      setExpandedProjects(initialState)
    }
  }, [workspace])

  /**
   * Toggles a project's open/closed state
   */
  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  /**
   * Renders a project and its files
   */
  const renderProject = (project: Project) => {
    const isExpanded = expandedProjects[project.id] || false

    return (
      <div key={project.id} className="mb-2 animate-in" style={{ animationDelay: "100ms" }}>
        <div
          className="flex items-center text-sm cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1.5 group"
          onClick={() => toggleProject(project.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-1.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1.5 text-muted-foreground" />
          )}
          <span className="font-medium">{project.name}</span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto opacity-50 group-hover:opacity-100 transition-opacity h-6 px-2 py-0 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              addConsoleMessage({
                type: "info",
                message: `Creating new chat for project: ${project.name}`,
              })

              openTab(`chat-${project.name}`)
            }}
          >
            <PenSquare className="h-3.5 w-3.5 mr-1" />
          </Button>
        </div>

        {isExpanded && (
          <div className="ml-4 space-y-1 mt-1 animate-in" style={{ animationDelay: "150ms" }}>
            {/* Project files */}
            <div className="space-y-1">
              {project.files.map((file) => (
                <FileItem key={file.id} file={file} onClick={() => openTab(file.id)} />
              ))}
            </div>
            
            {/* Project conversations */}
            <div className="space-y-1 mt-2">
              {project.conversations.map((conversation) => (
                <ChatItem 
                  key={conversation.id} 
                  conversation={conversation} 
                  onClick={() => openTab(`conv-${conversation.id}-${project.name}-${project.id}`)} 
                  onDelete={handleDeleteConversation}
                />
              ))}
            </div>

            {/* Documents button */}
            <div
              className="flex items-center text-sm cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1.5 group"
              onClick={() => {
                // Open a new tab to view all documents in table format
                const fileViewId = "file-view-" + project.id
                openTab(fileViewId)

                // Log for demonstration
                addConsoleMessage({
                  type: "info",
                  message: `Opening document view for project: ${project.name}`,
                })
              }}
            >
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              <span className="font-medium">Documents</span>
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                {project.documents.length}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-full bg-background border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        isExplorerOpen ? "w-64" : "w-0 overflow-hidden",
      )}
    >
      <div className="p-3 font-medium text-sm flex items-center justify-between border-b border-border">
        <span className="uppercase tracking-wide">Explorer</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={toggleExplorer}
          aria-label={isExplorerOpen ? "Collapse Explorer" : "Expand Explorer"}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div> */}

      <ScrollArea className="flex-1 overflow-auto">
        {workspace ? (
          <div className="p-1">
            <div className="flex items-center text-sm mb-3 cursor-pointer hover:bg-accent/50 rounded-md px-1 py-1.5 group">
              <span className="font-medium">{workspace.name}</span>
              <CreateProjectButton 
  variant="outline"
  buttonType="icon-only" 
  className="custom-class"
/>
            </div>
            <div className="space-y-1">{workspace.projects.map(renderProject)}</div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <p>Loading workspace...</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

