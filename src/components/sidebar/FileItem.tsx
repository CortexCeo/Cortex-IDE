"use client"
import { FileText, FileSpreadsheet, MessageSquareText, Terminal, LayoutDashboard, File } from "lucide-react"
import type { CortexFile } from "@/types"
import { cn } from "@/lib/utils"
import { useCortex } from "@/context/CortexContext"

/**
 * Props for the FileItem component
 */
interface FileItemProps {
  file: CortexFile
  onClick: () => void
}

/**
 * FileItem component - Displays a file in the file explorer
 */
export function FileItem({ file, onClick }: FileItemProps) {
  const { tabState } = useCortex()
  const isActive = tabState.activeTab === file.id

  // Get the appropriate icon based on file type
  const getIcon = () => {
    switch (file.type) {
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 text-yellow-500" />
      case "markdown":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "chat":
        return <MessageSquareText className="h-4 w-4 text-green-500" />
      case "python":
        return <Terminal className="h-4 w-4 text-purple-500" />
      case "dashboard":
        return <LayoutDashboard className="h-4 w-4 text-indigo-500" />
      case "documents":
        return <LayoutDashboard className="h-4 w-4 text-indigo-500" />
      default:
        return <MessageSquareText className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div
      className={cn(
        "flex items-center text-sm cursor-pointer rounded-md px-2 py-1.5 transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium border-l-1 border-primary"
          : "hover:bg-accent/50 text-foreground hover:border-l-1 hover:border-primary/40",
      )}
      onClick={onClick}
    >
      {getIcon()}
      <span className="ml-2 truncate">{file.name}</span>
    </div>
  )
}

