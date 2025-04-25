/**
 * Defines the structure of a file in the Cortex system
 */
export interface CortexFile {
  id: string
  name: string
  type: "excel" | "markdown" | "chat" | "python" | "dashboard" | "file-view" | "documents"
  icon?: string
  iconColor?: string
  content?: any
  lastModified?: Date
  createdBy?: string
}

/**
 * Defines the structure of a document in the Cortex system
 */
export interface CortexDocument {
  id: string
  name: string
  // type: "excel" | "markdown" | "chat" | "python" | "dashboard" | "file-view" | "documents" | "pdf" | "word" | "powerpoint" | "csv"
  documentType: string
  icon?: string
  iconColor?: string
  highlights: string[]
  summary: string
  // uploadDate: Date
  favorite?: boolean
}

/**
 * Defines the structure of a conversation in the Cortex system
 */
export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface CortexConversation {
  id: string
  title: string
  lastMessage?: string
  timestamp?: Date
  messageCount?: number
  favorite?: boolean
  user_id?: string
  project_id?: string
  messages?: any[]
}

/**
 * Defines the structure of a project in the Cortex system
 */
export interface Project {
  id: string
  name: string
  files: CortexFile[]
  isOpen?: boolean
  documents: CortexDocument[]
  conversations: CortexConversation[]
}

/**
 * Defines the structure of the workspace
 */
export interface Workspace {
  name: string
  projects: Project[]
}

/**
 * Tab state interface
 */
export interface TabState {
  activeTab: string
  openTabs: string[]
}

/**
 * Console message interface
 */
export interface ConsoleMessage {
  id: string
  type: "info" | "warning" | "error" | "output" | "query" | "response"
  message: string
  timestamp: Date
}

/**
 * AI Insight interface
 */
export interface AIInsight {
  id: string
  type: string
  content: any
}
