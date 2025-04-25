"use client"
import { useCortex } from "@/context/CortexContext"
import { ExcelContent } from "./ExcelContent"
import { MarkdownContent } from "./MarkdownContent"
import { ChatContent } from "./ChatContent"
import { PythonContent } from "./PythonContent"
import { CreateProjectButton } from "./CreateProject"
// import { Dashboard } from "../dashboard/Dashboard"
import { FileTableView } from "./FileTableView"
import { CortexConversation , Project} from "@/types"

/**
 * ContentContainer component - Displays the appropriate content based on the active tab
 */
export function ContentContainer() {
  const { tabState, getFileById, workspace } = useCortex()
  const { activeTab } = tabState

  // If no projects, show create project button
  if (workspace && workspace.projects.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No projects found in your workspace.</p>
        <CreateProjectButton size="lg" buttonType="default" />
      </div>
    )
  }
  
  // If no active tab, show empty state
  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No file selected. Open a file from the explorer.</p>
      </div>
    )
  }

  // Check if this is a file table view
  if (activeTab.startsWith("file-view-")) {
    const projectId = activeTab.replace("file-view-", "")
    return <FileTableView projectId={projectId} />
  }

  if (activeTab.startsWith("chat-")) {
    const projectId = activeTab.replace("chat-", "")
    console.log("Chat tab selected")
    return <ChatContent projectId={projectId} />
  }

  if (activeTab.startsWith('conv-')) {
    console.log(activeTab)
    const parts = activeTab.split('-')
    console.log("Conversation tab selected")
    console.log(parts)
    const conversationId = parts[1]
    const projectName = parts[2]
    const projectId = parts[3]
    const project = workspace?.projects.find((p: Project) => p.id === projectId)
    const conversation = project?.conversations.find((c: CortexConversation) => c.id === conversationId)
    
    return <ChatContent projectId={projectName} conversation={conversation!} />
  }

  // Get the file for the active tab
  const file = getFileById(activeTab)

  // If file not found, show error
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        <p>Error: File not found.</p>
      </div>
    )
  }

  // Render the appropriate content based on file type
  switch (file.type) {
    case "markdown":
      return <MarkdownContent fileId={file.id} />
    case "chat":
      return <ChatContent projectId={file.id} />
    case "python":
      return <PythonContent fileId={file.id} />
    case "dashboard":
      // return <Dashboard fileId={file.id} />
    default:
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>Unsupported file type.</p>
        </div>
      )
  }
}

