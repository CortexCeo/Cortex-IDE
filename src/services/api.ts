/**
 * API service for handling all backend requests
 */
import { mockWorkspaceApi, mockAiApi, mockConsoleApi } from "./mock-api"
import { USER_ID } from "@/config/user"

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development"

// Base API URL - would come from environment variables in production
// For Next.js API routes, we don't need a base URL as they're served from the same origin
const API_BASE_URL = ""

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    // Authentication would be added here
    // 'Authorization': `Bearer ${getToken()}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    // Parse JSON response
    const data = await response.json()
    return data as T
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

/**
 * Workspace API methods
 */
  // export const workspaceApi = isDevelopment
  //   ? mockWorkspaceApi
  //   : 
 export const workspaceApi = {
      getWorkspace: async () => {
        return fetchWithAuth<any>(`/api/project?userId=${USER_ID}`)
      },

      getFile: async (fileId: string) => {
        return fetchWithAuth<any>(`/files/${fileId}`)
      },

      saveFile: async (fileId: string, content: any) => {
        return fetchWithAuth<any>(`/files/${fileId}`, {
          method: "PUT",
          body: JSON.stringify({ content }),
        })
      },

      createFile: async (projectId: string, fileData: any) => {
        return fetchWithAuth<any>(`/projects/${projectId}/files`, {
          method: "POST",
          body: JSON.stringify(fileData),
        })
      },

      deleteFile: async (fileId: string) => {
        return fetchWithAuth<any>(`/files/${fileId}`, {
          method: "DELETE",
        })
      },
    }

/**
 * AI processing API methods
 */
export const aiApi = isDevelopment
  ? mockAiApi
  : {
      processCode: async (code: string, action: string) => {
        return fetchWithAuth<any>("/ai/code", {
          method: "POST",
          body: JSON.stringify({ code, action }),
        })
      },

      processMarkdown: async (markdown: string, action: string) => {
        return fetchWithAuth<any>("/ai/markdown", {
          method: "POST",
          body: JSON.stringify({ markdown, action }),
        })
      },

      getInsights: async (fileId: string) => {
        return fetchWithAuth<any>(`/ai/insights/${fileId}`)
      },

      analyzeData: async (data: any) => {
        return fetchWithAuth<any>("/ai/analyze", {
          method: "POST",
          body: JSON.stringify({ data }),
        })
      },
    }

/**
 * Console API methods
 */
export const consoleApi = isDevelopment
  ? mockConsoleApi
  : {
      getLogs: async () => {
        return fetchWithAuth<any>("/console/logs")
      },

      executeCode: async (code: string) => {
        return fetchWithAuth<any>("/console/execute", {
          method: "POST",
          body: JSON.stringify({ code }),
        })
      },
    }

