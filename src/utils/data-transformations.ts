/**
 * Utility functions for data transformations
 */

/**
 * Convert Excel-like data to a more structured format
 */
export function normalizeExcelData(data: any[]): any[] {
  if (!Array.isArray(data)) return []

  return data.map((row) => {
    // Ensure all numeric values are properly typed
    return {
      ...row,
      revenue: typeof row.revenue === "string" ? Number.parseFloat(row.revenue) : row.revenue,
      ebitda: typeof row.ebitda === "string" ? Number.parseFloat(row.ebitda) : row.ebitda,
      evEbitda: typeof row.evEbitda === "string" ? Number.parseFloat(row.evEbitda) : row.evEbitda,
      growth: typeof row.growth === "string" ? Number.parseFloat(row.growth) : row.growth,
    }
  })
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Sanitize markdown content
 */
export function sanitizeMarkdown(markdown: string): string {
  // Basic sanitization - remove potentially harmful content
  // In a real app, you'd use a proper sanitization library
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
}

/**
 * Sanitize Python code
 */
export function sanitizePythonCode(code: string): string {
  // Basic sanitization - remove potentially harmful imports
  // In a real app, you'd use a proper code analysis tool
  return code
    .replace(/import\s+os/g, "# import os - removed for security")
    .replace(/import\s+subprocess/g, "# import subprocess - removed for security")
    .replace(/import\s+sys/g, "# import sys - removed for security")
    .replace(/from\s+os\s+import/g, "# from os import - removed for security")
    .replace(/from\s+subprocess\s+import/g, "# from subprocess import - removed for security")
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

