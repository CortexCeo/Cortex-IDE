import type { Memory, MemoryTag, MemoryFilter } from "@/types/memory"
import { v4 as uuidv4 } from "uuid"

// Mock tags
export const predefinedTags: MemoryTag[] = [
  { id: "1", name: "Important", color: "#EF4444" },
  { id: "2", name: "Reference", color: "#3B82F6" },
  { id: "3", name: "Insight", color: "#10B981" },
  { id: "4", name: "Question", color: "#F59E0B" },
  { id: "5", name: "Hypothesis", color: "#8B5CF6" },
  { id: "6", name: "Evidence", color: "#EC4899" },
  { id: "7", name: "Contradiction", color: "#6366F1" },
  { id: "8", name: "Follow-up", color: "#14B8A6" },
]

// Mock memories data
const mockMemories: Memory[] = [
  {
    id: uuidv4(),
    title: "Neural network optimization techniques",
    content:
      "Gradient descent with momentum consistently outperforms standard gradient descent in deep neural networks, especially when dealing with noisy data. The momentum parameter between 0.8 and 0.9 seems optimal for most applications.",
    source: "deep-research",
    sourceReference: "project-123",
    tags: [predefinedTags[2], predefinedTags[5]],
    createdAt: new Date("2025-03-10T14:30:00"),
    updatedAt: new Date("2025-03-10T14:30:00"),
    isPinned: true,
    confidence: 85,
  },
  {
    id: uuidv4(),
    title: "Market segmentation analysis for Project X",
    content:
      "The demographic analysis shows three distinct user segments: tech-savvy professionals (35-45), early adopters (25-34), and enterprise decision makers (45-55). Each segment has different feature priorities and price sensitivity.",
    source: "zone-research",
    sourceReference: "zone-456",
    tags: [predefinedTags[2], predefinedTags[4]],
    createdAt: new Date("2025-03-08T10:15:00"),
    updatedAt: new Date("2025-03-09T16:20:00"),
    isPinned: false,
    confidence: 72,
  },
  {
    id: uuidv4(),
    title: "GPT-4o hallucination patterns",
    content:
      'When asked about specific technical specifications, GPT-4o tends to hallucinate details when confidence is below 65%. Implementing a confidence threshold and fallback to "I don\'t know" responses could reduce incorrect information by approximately 40%.',
    source: "ai-chat",
    sourceReference: "chat-789",
    tags: [predefinedTags[3], predefinedTags[6]],
    createdAt: new Date("2025-03-12T09:45:00"),
    updatedAt: new Date("2025-03-12T09:45:00"),
    isPinned: true,
    aiModel: "GPT-4o",
  },
  {
    id: uuidv4(),
    title: "Competitive analysis framework",
    content:
      "The 5-point competitive analysis framework: 1) Feature comparison, 2) Pricing strategy, 3) Market positioning, 4) Customer sentiment, 5) Growth trajectory. Apply weighted scoring based on our strategic priorities.",
    source: "manual",
    tags: [predefinedTags[1]],
    createdAt: new Date("2025-03-05T11:20:00"),
    updatedAt: new Date("2025-03-05T11:20:00"),
    isPinned: false,
  },
  {
    id: uuidv4(),
    title: "Claude 3 Opus citation accuracy",
    content:
      "Claude 3 Opus demonstrates 92% accuracy in scientific paper citations when provided with the full paper text. However, accuracy drops to 67% when only given abstracts. Consider implementing a paper retrieval system to improve citation quality.",
    source: "ai-chat",
    sourceReference: "chat-101",
    tags: [predefinedTags[2], predefinedTags[5]],
    createdAt: new Date("2025-03-11T15:30:00"),
    updatedAt: new Date("2025-03-11T15:30:00"),
    isPinned: false,
    aiModel: "Claude 3 Opus",
  },
]

// Get memories from localStorage or use mock data
const getInitialMemories = (): Memory[] => {
  if (typeof window === "undefined") return mockMemories

  const savedMemories = localStorage.getItem("cortexMemories")
  if (savedMemories) {
    try {
      return JSON.parse(savedMemories).map((memory: any) => ({
        ...memory,
        createdAt: new Date(memory.createdAt),
        updatedAt: new Date(memory.updatedAt),
      }))
    } catch (error) {
      console.error("Failed to parse memories from localStorage", error)
      return mockMemories
    }
  }
  return mockMemories
}

// Save memories to localStorage
const saveMemories = (memories: Memory[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cortexMemories", JSON.stringify(memories))
  }
}

// Memory service
export const memoryService = {
  // Get all memories
  getMemories: (): Memory[] => {
    return getInitialMemories()
  },

  // Filter memories
  filterMemories: (filter: MemoryFilter): Memory[] => {
    let memories = getInitialMemories()

    // Apply search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      memories = memories.filter(
        (memory) => memory.title.toLowerCase().includes(query) || memory.content.toLowerCase().includes(query),
      )
    }

    // Filter by sources
    if (filter.sources.length > 0) {
      memories = memories.filter((memory) => filter.sources.includes(memory.source))
    }

    // Filter by tags
    if (filter.tags.length > 0) {
      memories = memories.filter((memory) => memory.tags.some((tag) => filter.tags.includes(tag.id)))
    }

    // Filter by date range
    if (filter.dateRange) {
      memories = memories.filter(
        (memory) => memory.createdAt >= filter.dateRange!.start && memory.createdAt <= filter.dateRange!.end,
      )
    }

    // Filter pinned only
    if (filter.pinnedOnly) {
      memories = memories.filter((memory) => memory.isPinned)
    }

    // Sort memories
    if (filter.sortBy === "newest") {
      memories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } else if (filter.sortBy === "oldest") {
      memories.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    }
    // Relevance sorting would require more complex logic in a real app

    return memories
  },

  // Add a new memory
  addMemory: (memory: Omit<Memory, "id" | "createdAt" | "updatedAt">): Memory => {
    const newMemory: Memory = {
      ...memory,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const memories = getInitialMemories()
    const updatedMemories = [newMemory, ...memories]
    saveMemories(updatedMemories)

    return newMemory
  },

  // Update an existing memory
  updateMemory: (id: string, updates: Partial<Memory>): Memory | null => {
    const memories = getInitialMemories()
    const memoryIndex = memories.findIndex((memory) => memory.id === id)

    if (memoryIndex === -1) return null

    const updatedMemory = {
      ...memories[memoryIndex],
      ...updates,
      updatedAt: new Date(),
    }

    memories[memoryIndex] = updatedMemory
    saveMemories(memories)

    return updatedMemory
  },

  // Delete a memory
  deleteMemory: (id: string): boolean => {
    const memories = getInitialMemories()
    const filteredMemories = memories.filter((memory) => memory.id !== id)

    if (filteredMemories.length === memories.length) return false

    saveMemories(filteredMemories)
    return true
  },

  // Toggle pin status
  togglePin: (id: string): Memory | null => {
    const memories = getInitialMemories()
    const memoryIndex = memories.findIndex((memory) => memory.id === id)

    if (memoryIndex === -1) return null

    const updatedMemory = {
      ...memories[memoryIndex],
      isPinned: !memories[memoryIndex].isPinned,
      updatedAt: new Date(),
    }

    memories[memoryIndex] = updatedMemory
    saveMemories(memories)

    return updatedMemory
  },

  // Get all tags
  getTags: (): MemoryTag[] => {
    return predefinedTags
  },
}

