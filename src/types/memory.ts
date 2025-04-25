export type MemorySource = "deep-research" | "zone-research" | "ai-chat" | "manual"

export type MemoryTag = {
  id: string
  name: string
  color: string
}

export interface Memory {
  id: string
  title: string
  content: string
  source: MemorySource
  sourceReference?: string // URL, document ID, or chat ID
  tags: MemoryTag[]
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  author?: string
  aiModel?: string // For AI chat memories
  confidence?: number // For research insights, 0-100
}

export interface MemoryFilter {
  searchQuery: string
  sources: MemorySource[]
  tags: string[] // Tag IDs
  dateRange?: {
    start: Date
    end: Date
  }
  sortBy: "newest" | "oldest" | "relevance"
  pinnedOnly: boolean
}

