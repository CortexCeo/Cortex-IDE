"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, TableProperties } from "lucide-react"

type DataRow = Record<string, any>

interface ExcelContentProps {
  data: DataRow[] // The data to display as a spreadsheet
}

/**
 * ExcelContent component - Displays Excel spreadsheet content with backend integration
 */
export function ExcelContent({ data }: ExcelContentProps) {
  // Local state
  const [tableData, setTableData] = useState<DataRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [columnLabels, setColumnLabels] = useState<string[]>([])
  const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null)
  const [editValue, setEditValue] = useState("")

  // Update local state when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data)
      
      // Extract columns from the first row's keys
      const firstRow = data[0]
      const extractedColumns = Object.keys(firstRow)
      setColumns(extractedColumns)
      
      // Generate column labels by capitalizing first letter of each key
      const labels = extractedColumns.map(col => {
        // Convert camelCase to Title Case with spaces
        return col
          .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
          .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
          .trim() // Remove leading/trailing spaces
      })
      setColumnLabels(labels)
    }
  }, [data])

  // Handle cell click to start editing
  const handleCellClick = (row: number, col: string, value: any) => {
    setEditCell({ row, col })
    setEditValue(String(value))
  }

  // Handle cell value change
  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  // Handle saving the edited value
  const handleCellBlur = () => {
    if (editCell) {
      const { row, col } = editCell
      const newData = [...tableData]

      // Determine if the value should be a number or string based on original type
      const originalValue = newData[row][col]
      const isNumberType = typeof originalValue === 'number'
      
      // Update the value with appropriate type conversion
      if (isNumberType) {
        newData[row][col] = Number.parseFloat(editValue) || 0
      } else {
        newData[row][col] = editValue
      }

      setTableData(newData)
      setEditCell(null)
    }
  }

  // Handle key press events (Enter to save, Escape to cancel)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCellBlur()
    } else if (e.key === "Escape") {
      setEditCell(null)
    }
  }

  // Format value for display
  const formatDisplayValue = (value: any, colName: string): string => {
    if (value === null || value === undefined) return ''
    
    // Check if the column name contains certain keywords to apply formatting
    const colLower = colName.toLowerCase()
    
    if (typeof value === 'number') {
      if (colLower.includes('ev') && colLower.includes('ebitda')) {
        return `${value}x`
      } else if (colLower.includes('growth') || colLower.includes('percent') || colLower.includes('%')) {
        return `${value}%`
      } else if (colLower.includes('price') || colLower.includes('revenue') || colLower.includes('ebitda') || colLower.includes('income')) {
        // Financial values potentially in millions or billions
        return value.toString()
      }
    }
    
    return value.toString()
  }

  // Show loading state if no data is available yet
  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-background border-b border-border p-2 flex items-center justify-between">
        <div className="flex items-center">
          <TableProperties className="h-4 w-4 mr-2 text-blue-500" />
          <h3 className="text-sm font-medium">Spreadsheet Data</h3>
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4">
          <table className="w-full border-collapse shadow-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-xs font-medium"></th>
                {/* Generate column headers (A, B, C, etc.) based on number of columns */}
                {columns.map((_, index) => {
                  // Convert index to Excel-style column label (A, B, C, ... Z, AA, AB, etc)
                  const colLabel = String.fromCharCode(65 + index % 26) + (index >= 26 ? Math.floor(index / 26) : '')
                  return (
                    <th key={index} className="border border-border p-2 text-xs font-medium">{colLabel}</th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {/* Header row with column labels */}
              <tr>
                <td className="border border-border p-2 text-xs font-medium bg-muted/50">1</td>
                {columnLabels.map((label, index) => (
                  <td key={index} className="border border-border p-2 text-xs font-medium">
                    {label}
                  </td>
                ))}
              </tr>

              {/* Data rows */}
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-border p-2 text-xs font-medium bg-muted/50">{rowIndex + 2}</td>
                  {columns.map((col, colIndex) => {
                    const value = row[col]
                    const isEditing = editCell?.row === rowIndex && editCell?.col === col
                    const displayValue = formatDisplayValue(value, col)

                    return (
                      <td
                        key={colIndex}
                        className="border border-border p-0 text-xs relative"
                        onClick={() => !isEditing && handleCellClick(rowIndex, col, value)}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={handleCellChange}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full h-full p-2 outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                        ) : (
                          <div className="p-2 w-full h-full hover:bg-blue-50/30 cursor-pointer transition-colors">
                            {displayValue}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}

              {/* Empty rows */}
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-border p-2 text-xs font-medium bg-muted/50">
                    {index + tableData.length + 2}
                  </td>
                  {columns.map((col, colIndex) => (
                    <td
                      key={`empty-cell-${index}-${colIndex}`}
                      className="border border-border p-2 text-xs hover:bg-blue-50/30 cursor-pointer transition-colors"
                      onClick={() => handleCellClick(index + tableData.length, col, "")}
                    ></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  )
}

