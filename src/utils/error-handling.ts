/**
 * Utility functions for error handling
 */

/**
 * Format error message from various error types
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "An unknown error occurred"
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  fields: Record<string, string>

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = "ValidationError"
    this.fields = fields
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return fallback
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let retries = 0
  let delay = initialDelay

  while (true) {
    try {
      return await fn()
    } catch (error) {
      retries++

      if (retries >= maxRetries) {
        throw error
      }

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Increase delay for next retry
      delay *= 2
    }
  }
}

