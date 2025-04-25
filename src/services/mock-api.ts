/**
 * Mock API implementation for development
 * This will be used when the real backend is not available
 */
import { initialWorkspace, initialAIInsights, excelData, pythonCode, contractDraftContent } from "@/data/initialData"
import { deepClone } from "@/utils/data-transformations"

// In-memory storage for mock data
const workspace = deepClone(initialWorkspace)
const aiInsights = deepClone(initialAIInsights)
const consoleMessages: any[] = []

// Mock delay to simulate network latency
const MOCK_DELAY = 500

/**
 * Helper to simulate API delay
 */
async function delay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock workspace API
 */
export const mockWorkspaceApi = {
  getWorkspace: async () => {
    await delay()
    return deepClone(workspace)
  },

  getFile: async (fileId: string) => {
    await delay()

    // Find the file in the workspace
    for (const project of workspace.projects) {
      const file = project.files.find((f) => f.id === fileId)
      if (file) {
        // Return mock content based on file type
        let content
        switch (file.type) {
          case "excel":
            content = deepClone(excelData)
            break
          case "python":
            content = pythonCode
            break
          case "markdown":
            content = contractDraftContent
            break
          default:
            content = file.content || null
        }

        return {
          ...deepClone(file),
          content,
        }
      }
    }

    throw new Error(`File not found: ${fileId}`)
  },

  saveFile: async (fileId: string, content: any) => {
    await delay()

    // Find and update the file in the workspace
    for (const project of workspace.projects) {
      const fileIndex = project.files.findIndex((f) => f.id === fileId)
      if (fileIndex >= 0) {
        // Update the file content
        project.files[fileIndex].content = deepClone(content)
        return { success: true }
      }
    }

    throw new Error(`File not found: ${fileId}`)
  },

  createFile: async (projectId: string, fileData: any) => {
    await delay()

    // Find the project
    const projectIndex = workspace.projects.findIndex((p) => p.id === projectId)
    if (projectIndex < 0) {
      throw new Error(`Project not found: ${projectId}`)
    }

    // Create a new file
    const newFile = {
      id: `file-${Date.now()}`,
      ...fileData,
    }

    // Add to the project
    workspace.projects[projectIndex].files.push(newFile)

    return deepClone(newFile)
  },

  deleteFile: async (fileId: string) => {
    await delay()

    // Find and delete the file
    for (const project of workspace.projects) {
      const fileIndex = project.files.findIndex((f) => f.id === fileId)
      if (fileIndex >= 0) {
        // Remove the file
        project.files.splice(fileIndex, 1)
        return { success: true }
      }
    }

    throw new Error(`File not found: ${fileId}`)
  },
}

/**
 * Mock AI API
 */
export const mockAiApi = {
  processCode: async (code: string, action: string) => {
    await delay(2000) // Longer delay to simulate AI processing

    // Simulate different AI improvements
    let processedCode = code

    switch (action) {
      case "optimize":
        processedCode = code.replace(/# Calculate additional metrics/, "# Vectorized operations for better performance")
        break
      case "comments":
        processedCode = `# This is an AI-enhanced version with better comments\n${code}`
        break
      case "types":
        processedCode = code.replace(
          /def calculate_metrics$$df$$:/,
          "def calculate_metrics(df: pd.DataFrame) -> pd.DataFrame:",
        )
        break
      // Add other cases as needed
    }

    return { processedCode }
  },

  processMarkdown: async (markdown: string, action: string) => {
    await delay(1500) // Longer delay to simulate AI processing

    // Simulate different AI improvements
    let processedMarkdown = markdown

    switch (action) {
      case "shorten":
        processedMarkdown = markdown.split("\n").slice(0, 5).join("\n") + "\n\n(Content shortened by AI)"
        break
      case "lengthen":
        processedMarkdown =
          markdown +
          "\n\n## Additional Information\n\nThis section was added by AI to provide more context and details."
        break
      case "formal":
        processedMarkdown = markdown.replace(/agreement/g, "contractual agreement")
        break
      // Add other cases as needed
    }

    return { processedMarkdown }
  },

  getInsights: async (fileId: string) => {
    await delay()
    return deepClone(aiInsights)
  },

  analyzeData: async (data: any) => {
    await delay(2000)
    return {
      analysis: "AI analysis complete. Found potential opportunities in the data.",
      insights: deepClone(aiInsights),
    }
  },
}

/**
 * Mock console API
 */
export const mockConsoleApi = {
  getLogs: async () => {
    await delay()
    return deepClone(consoleMessages)
  },

  executeCode: async (code: string) => {
    await delay(1000)

    // Add a mock console message
    const message = {
      id: `msg-${Date.now()}`,
      type: "output",
      message: `Executed code: ${code.substring(0, 50)}...`,
      timestamp: new Date(),
    }

    consoleMessages.push(message)

    return {
      success: true,
      output: "Code execution simulated in development environment.",
    }
  },
}

