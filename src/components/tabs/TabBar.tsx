"use client"
import { SplitSquareVertical, Maximize2, Minimize2, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCortex } from "@/context/CortexContext"
import { TabItem } from "./TabItem"
import type { CortexFile, Project, CortexConversation } from "@/types"

/**
 * TabBar component - Displays the tab bar with open files
 */
export function TabBar() {
  const { tabState, openTab, closeTab, getFileById, workspace } = useCortex()
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <div className="flex items-center border-b border-border bg-background/80 backdrop-blur-sm h-10 w-full overflow-hidden">
      <div className="flex h-full overflow-x-auto max-w-[calc(100%-40px)]">
        {tabState.openTabs.map((fileId) => {
          // Handle special case for document view tabs
          if (fileId.startsWith('file-view-')) {
            const projectId = fileId.replace('file-view-', '')
            const project = workspace?.projects.find((p: Project) => p.id === projectId)
            
            // Create a dummy file object for the document view
            const dummyFile: CortexFile = {
              id: fileId,
              name: project ? `${project.name} Documents` : 'Documents',
              type: "documents",
              content: '',
              icon: "folder",
              iconColor: "text-blue-500",
              lastModified: new Date(),
              createdBy: 'system'
            }
            
            return (
              <TabItem
                key={fileId}
                file={dummyFile}
                isActive={tabState.activeTab === fileId}
                onClick={() => openTab(fileId)}
                onClose={() => closeTab(fileId)}
              />
            )
          }
          
          // Handle chat tabs created from project sidebar
          if (fileId.startsWith('chat-')) {
            const parts = fileId.split('-')
            const projectName = parts[1]
            const project = workspace?.projects.find((p: Project) => p.name === projectName)
            
            // Create a dummy file object for the chat
            const dummyFile: CortexFile = {
              id: fileId,
              name: project ? `Chat: ${project.name}` : 'Chat',
              type: "chat",
              content: '',
              icon: "message-square",
              iconColor: "text-green-500",
              lastModified: new Date(),
              createdBy: 'system'
            }
            
            return (
              <TabItem
                key={fileId}
                file={dummyFile}
                isActive={tabState.activeTab === fileId}
                onClick={() => openTab(fileId)}
                onClose={() => closeTab(fileId)}
              />
            )
          }

          if (fileId.startsWith('conv-')) {
            console.log("Conversation tab selected from tab bar")
            console.log(fileId)
            const parts = fileId.split('-')
            const conversationId = parts[1]
            const projectName = parts[2] // Now using project name instead of ID
            const projectId = parts[3] // Project ID
            console.log(`Looking for project with name: ${projectName}`)
            
            // Find the project by name instead of ID
            const project = workspace?.projects.find((p: Project) => p.id === projectId)
            console.log(`Found project:`, project)
            
            const conversation = project?.conversations.find((c: CortexConversation) => c.id === conversationId)
            console.log(`Found conversation:`, conversation)
            
            // If conversation not found, create a dummy one to prevent errors
            if (!conversation) {
              console.error(`Could not find conversation with id ${conversationId} in project ${projectName}`)
              
              // Create a dummy conversation object
              const dummyConversation: CortexConversation = {
                id: conversationId,
                title: `Conversation (${conversationId.slice(0, 6)}...)`,
                messages: [],
                timestamp: new Date(),
                messageCount: 0
              }
              
              return (
                <TabItem
                  key={fileId}
                  file={dummyConversation}
                  isActive={tabState.activeTab === fileId}
                  onClick={() => openTab(fileId)}
                  onClose={() => closeTab(fileId)}
                />
              )
            }
            
            return (
              <TabItem
                key={fileId}
                file={conversation}
                isActive={tabState.activeTab === fileId}
                onClick={() => openTab(fileId)}
                onClose={() => closeTab(fileId)}
              />
            )
          }
          
          // Handle regular file tabs
          const file = getFileById(fileId)
          if (!file) return null

          return (
            <TabItem
              key={fileId}
              file={file}
              isActive={tabState.activeTab === fileId}
              onClick={() => openTab(fileId)}
              onClose={() => closeTab(fileId)}
            />
          )
        })}
      </div>
      <div className="ml-auto flex items-center pr-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-foreground" 
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
