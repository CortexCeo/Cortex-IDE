"use client"
import { X, FileText, FileSpreadsheet, MessageSquareText, Terminal, LayoutDashboard, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { CortexFile, CortexConversation } from "@/types"

/**
 * Props for the TabItem component
 */
interface TabItemProps {
  file: CortexFile | CortexConversation
  isActive: boolean
  onClick: () => void
  onClose: () => void
}

// Type guard to check if the item is a CortexFile or CortexConversation
function isCortexFile(item: CortexFile | CortexConversation | undefined): item is CortexFile {
  return !!item && 'type' in item;
}

/**
 * TabItem component - Displays a tab in the tab bar
 */
export function TabItem({ file, isActive, onClick, onClose }: TabItemProps) {
  // Get the appropriate icon based on whether it's a file or conversation
  const getIcon = () => {
    if (isCortexFile(file)) {
      // It's a file, use the file type to determine the icon
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
          return <FileText className="h-4 w-4 text-indigo-500" />
        default:
          return <File className="h-4 w-4 text-gray-500" />
      }
    } else {
      // It's a conversation, use the message icon
      return <MessageSquareText className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div
      className={cn(
        "h-full px-4 text-sm border-r border-border flex items-center gap-2 cursor-pointer group transition-colors",
        isActive
          ? "bg-background text-foreground border-b-2 border-b-primary"
          : "bg-muted/20 text-muted-foreground hover:bg-muted/30",
      )}
      onClick={onClick}
    >
      {getIcon()}
      <span className="ml-2 truncate max-w-[100px]">
        {isCortexFile(file) ? file.name : file.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
          isActive ? "hover:bg-muted" : "hover:bg-background",
        )}
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
