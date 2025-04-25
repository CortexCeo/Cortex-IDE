export interface MemoryItem {
  id: string
  type: "interaction" | "query" | "behavior" | "explicit" | "derived"
  content: string
  timestamp: string
  confidence: number
  source: string
}

export interface UserPreference {
  id: string
  category: "Interface" | "Communication" | "Technical" | "Workflow" | "Privacy"
  name: string
  value: string | number | boolean
  lastUpdated: string
}

export interface UserMemoryState {
  memoryItems: MemoryItem[]
  preferences: UserPreference[]
  insights: any[] // To be defined later
  history: any[] // To be defined later
}

