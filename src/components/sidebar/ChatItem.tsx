"use client"
import { MessageSquareText, Trash2 } from "lucide-react"
import { useState } from "react"
import type { CortexConversation } from "@/types"
import { cn } from "@/lib/utils"
import { useCortex } from "@/context/CortexContext"

/**
 * Props for the ChatItem component
 */
interface ChatItemProps {
  conversation: CortexConversation
  onClick: () => void
  onDelete?: (id: string) => void
}

/**
 * ChatItem component - Displays a conversation in the file explorer
 */
export function ChatItem({ conversation, onClick, onDelete }: ChatItemProps) {
  const { tabState } = useCortex()
  const isActive = tabState.activeTab === `conv-${conversation.id}-${conversation.project_id}`
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(conversation.id)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm cursor-pointer rounded-md px-2 py-1.5 transition-colors group w-[230px]",
        isActive
          ? "bg-primary/10 text-primary font-medium border-l-1 border-primary"
          : "hover:bg-accent/50 text-foreground hover:border-l-1 hover:border-primary/40",
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center min-w-0 flex-1">
        <MessageSquareText className="h-4 w-4 text-green-500 flex-shrink-0" />
        <span className="ml-2 truncate">{conversation.title}</span>
      </div>
      {(isHovered || isActive) && onDelete && (
        <button 
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
          aria-label="Delete conversation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
