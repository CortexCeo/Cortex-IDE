"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Settings,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  BookOpen,
  Globe,
  Database,
  BarChart,
  Edit,
  Play,
  Pause,
  ArrowRight,
  History,
  Workflow,
  CheckCircle2,
  AlertCircle,
  Microscope,
  PlusCircle,
  Folder,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Custom ArrowUpDown component
const ArrowUpDown = ({ className }: { className?: string }) => (
  <div className={cn("flex flex-col", className)}>
    <ChevronUp className="h-2 w-2" />
    <ChevronDown className="h-2 w-2" />
  </div>
)

interface ZoneResearchProps {
  onClose: () => void
}

// Research flow stages
type ResearchStage = "initial" | "planning" | "reasoning" | "results"

// Research plan type
interface ResearchPlan {
  title: string
  description: string
  steps: {
    id: string
    title: string
    description: string
    status: "pending" | "in-progress" | "completed" | "error"
  }[]
}

// Data structure for the table
interface DataRow {
  id: string
  document: string
  documentType: "Presentation" | "Regulatory Filing" | "Transcript" | "Press Release" | "Reviews"
  highlights: string[]
  targetCustomers: string[]
  qualityScore: "High" | "Medium" | "Low"
  date: string
}

// Add this interface for custom columns after the DataRow interface
interface CustomColumn {
  id: string
  name: string
  isEditing: boolean
}

export function ZoneResearch({ onClose }: ZoneResearchProps) {
  // State for sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Research flow state
  const [researchStage, setResearchStage] = useState<ResearchStage>("initial")
  const [researchQuery, setResearchQuery] = useState("")
  const [researchPlan, setResearchPlan] = useState<ResearchPlan | null>(null)
  const [isEditingPlan, setIsEditingPlan] = useState(false)
  const [editedPlanText, setEditedPlanText] = useState("")
  const [reasoningSteps, setReasoningSteps] = useState<string[]>([])
  const [currentReasoningStep, setCurrentReasoningStep] = useState(0)
  const [researchProgress, setResearchProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Add this state for custom columns after the other state declarations
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([])

  // Sample projects data
  const projects = [
    { id: "project-1", name: "Project Alpha", count: 3 },
    { id: "project-2", name: "Project Beta", count: 5 },
    { id: "project-3", name: "Project Gamma", count: 2 },
  ]

  // Chat interface state
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Table sorting state
  const [sortColumn, setSortColumn] = useState<keyof DataRow | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Sample data
  const data: DataRow[] = [
    {
      id: "doc-1",
      document: "Peloton Annual Report 2023",
      documentType: "Regulatory Filing",
      highlights: [
        "Revenue increased by 12% year-over-year",
        "Subscription business grew to 65% of total revenue",
        "International expansion in progress with 5 new markets",
      ],
      targetCustomers: ["Fitness enthusiasts aged 25-45", "High-income urban professionals", "Home fitness adopters"],
      qualityScore: "High",
      date: "2023-09-15",
    },
    {
      id: "doc-2",
      document: "Peloton Product Roadmap",
      documentType: "Presentation",
      highlights: [
        "New lower-cost treadmill planned for Q2 2024",
        "Strength training equipment expansion",
        "Enhanced digital-only subscription features",
      ],
      targetCustomers: ["Price-sensitive fitness consumers", "Strength training enthusiasts", "Digital-first users"],
      qualityScore: "Medium",
      date: "2023-11-02",
    },
    {
      id: "doc-3",
      document: "Peloton Q3 Earnings Call",
      documentType: "Transcript",
      highlights: [
        "Subscription retention rate at 92%",
        "Average monthly workouts per user increased to 18.5",
        "Cost reduction initiatives on track",
      ],
      targetCustomers: ["Existing Peloton hardware owners", "Investors and stakeholders", "Fitness industry analysts"],
      qualityScore: "High",
      date: "2023-08-24",
    },
    {
      id: "doc-4",
      document: "Peloton Guide Launch",
      documentType: "Press Release",
      highlights: [
        "New AI-powered strength training device",
        "Priced at $295 with no subscription requirement",
        "Compatible with existing Peloton ecosystem",
      ],
      targetCustomers: [
        "Strength training beginners",
        "Existing Peloton bike/tread owners",
        "Fitness tech early adopters",
      ],
      qualityScore: "Medium",
      date: "2023-10-12",
    },
    {
      id: "doc-5",
      document: "Peloton App User Feedback",
      documentType: "Reviews",
      highlights: [
        "4.2/5 average rating across platforms",
        "Praise for class variety and instructor quality",
        "Complaints about occasional technical issues",
      ],
      targetCustomers: [
        "Mobile-first fitness users",
        "Travelers and on-the-go professionals",
        "Subscription-only customers",
      ],
      qualityScore: "Low",
      date: "2023-12-01",
    },
  ]

  const handleSort = (column: keyof DataRow) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (sortColumn) {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === "asc" ? comparison : -comparison
      }
    }
    return 0
  })

  // Handle sending a research query
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    setResearchQuery(inputValue)
    setInputValue("")
    setIsLoading(true)

    // Simulate starting research process
    setTimeout(() => {
      setResearchStage("planning")
      setIsLoading(false)

      // Generate research plan
      const plan: ResearchPlan = {
        title: `Research: ${inputValue}`,
        description: `Comprehensive analysis of ${inputValue} with multiple sources and perspectives.`,
        steps: [
          {
            id: "step-1",
            title: "Document Collection",
            description: "Gather relevant documents and data sources.",
            status: "pending",
          },
          {
            id: "step-2",
            title: "Content Analysis",
            description: "Analyze document contents and extract key information.",
            status: "pending",
          },
          {
            id: "step-3",
            title: "Pattern Recognition",
            description: "Identify patterns and trends across documents.",
            status: "pending",
          },
          {
            id: "step-4",
            title: "Insight Generation",
            description: "Generate insights and conclusions from the analysis.",
            status: "pending",
          },
        ],
      }

      setResearchPlan(plan)
      setEditedPlanText(JSON.stringify(plan, null, 2))
    }, 2000)
  }

  // Start the research execution
  const startResearch = () => {
    if (!researchPlan) return

    setResearchStage("reasoning")
    setIsEditingPlan(false)

    // Set up reasoning steps
    const steps = [
      "Collecting and organizing relevant documents...",
      "Analyzing document contents and extracting key information...",
      "Identifying patterns and trends across documents...",
      "Generating insights and conclusions...",
      "Preparing final analysis table...",
    ]

    setReasoningSteps(steps)

    // Simulate reasoning progress
    let step = 0
    const interval = setInterval(() => {
      if (isPaused) return

      if (step < steps.length) {
        if (researchPlan && step < researchPlan.steps.length) {
          const updatedPlan = { ...researchPlan }
          updatedPlan.steps[step].status = "in-progress"
          setResearchPlan(updatedPlan)
        }

        setCurrentReasoningStep(step)
        setResearchProgress(Math.round((step / steps.length) * 100))

        if (step > 0 && researchPlan && step - 1 < researchPlan.steps.length) {
          const updatedPlan = { ...researchPlan }
          updatedPlan.steps[step - 1].status = "completed"
          setResearchPlan(updatedPlan)
        }

        step++
      } else {
        clearInterval(interval)

        if (researchPlan) {
          const updatedPlan = { ...researchPlan }
          updatedPlan.steps[updatedPlan.steps.length - 1].status = "completed"
          setResearchPlan(updatedPlan)
        }

        setResearchProgress(100)

        // Move to results stage
        setTimeout(() => {
          setResearchStage("results")
        }, 1000)
      }
    }, 2000)

    return () => clearInterval(interval)
  }

  // Toggle research pause state
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Handle editing the research plan
  const savePlanEdits = () => {
    try {
      const updatedPlan = JSON.parse(editedPlanText)
      setResearchPlan(updatedPlan)
      setIsEditingPlan(false)
    } catch (error) {
      console.error("Invalid JSON:", error)
    }
  }

  // Reset research to initial state
  const resetResearch = () => {
    setResearchStage("initial")
    setResearchQuery("")
    setResearchPlan(null)
    setIsEditingPlan(false)
    setEditedPlanText("")
    setReasoningSteps([])
    setCurrentReasoningStep(0)
    setResearchProgress(0)
    setIsPaused(false)
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Add this function to handle adding a new column before the return statement
  const handleAddColumn = () => {
    const newColumnId = `custom-col-${customColumns.length + 1}`
    setCustomColumns([
      ...customColumns,
      {
        id: newColumnId,
        name: "New Column",
        isEditing: true,
      },
    ])
  }

  // Add this function to handle updating column name
  const handleColumnNameChange = (id: string, name: string) => {
    setCustomColumns(customColumns.map((col) => (col.id === id ? { ...col, name } : col)))
  }

  // Add this function to handle finishing editing
  const handleFinishEditing = (id: string) => {
    setCustomColumns(customColumns.map((col) => (col.id === id ? { ...col, isEditing: false } : col)))
  }

  // Add this function to generate placeholder data for a column
  const getPlaceholderData = (row: DataRow, columnId: string) => {
    // Generate different placeholder data based on document type
    const baseText =
      row.documentType === "Regulatory Filing"
        ? "Financial details and compliance information"
        : row.documentType === "Presentation"
          ? "Key presentation points and strategic direction"
          : row.documentType === "Transcript"
            ? "Important discussion points from the call"
            : row.documentType === "Press Release"
              ? "Announcement highlights and market implications"
              : "User feedback and sentiment analysis"

    return `${baseText} for ${row.document.split(" ")[0]}`
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div
        className={cn(
          "border-r border-border flex flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-64",
        )}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" className="-ml-2" onClick={onClose}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Explorer
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold mb-1">Zone Research</h2>
          <p className="text-sm text-muted-foreground">Document analysis assistant</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 mb-2">
                Document Sources
              </h3>
              <Button variant="ghost" className="w-full justify-start text-sm h-9 px-2">
                <Globe className="h-4 w-4 mr-2 text-blue-500" />
                Document Search
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm h-9 px-2">
                <Database className="h-4 w-4 mr-2 text-green-500" />
                Document Library
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm h-9 px-2">
                <FileText className="h-4 w-4 mr-2 text-yellow-500" />
                Recent Documents
              </Button>
            </div>

            <div className="space-y-1 mt-4 mb-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 mb-2">Projects</h3>
              {projects.map((project) => (
                <Button key={project.id} variant="ghost" className="w-full justify-start text-sm h-9 px-2">
                  <Folder className="h-4 w-4 mr-2 text-primary" />
                  <span className="flex-1 text-left">{project.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {project.count}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 mb-2">
                Analysis Tools
              </h3>
              <Button variant="ghost" className="w-full justify-start text-sm h-9 px-2">
                <BarChart className="h-4 w-4 mr-2 text-purple-500" />
                Analysis History
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm h-9 px-2">
                <BookOpen className="h-4 w-4 mr-2 text-red-500" />
                Saved Analysis
              </Button>
            </div>
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <Button className="w-full" variant="outline">
            <History className="h-4 w-4 mr-2" />
            Analysis History
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {isSidebarCollapsed && (
                <Button variant="ghost" size="icon" className="mr-2" onClick={toggleSidebar}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <Microscope className="h-5 w-5 mr-2 text-primary" />
              <h1 className="text-xl font-semibold">Zone Research Assistant</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Chat Input - Only show in initial stage */}
          {researchStage === "initial" && (
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Input
                  placeholder="Enter your research query..."
                  className="pr-24 py-6 text-base"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full",
                      "bg-primary text-primary-foreground",
                      "transition-all duration-200",
                      (!inputValue.trim() || isLoading) && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={!inputValue.trim() || isLoading}
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {researchStage === "planning" && (
            <div className="max-w-3xl mx-auto p-6">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{researchPlan?.title}</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingPlan(!isEditingPlan)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditingPlan ? "Cancel" : "Edit Plan"}
                    </Button>
                  </div>
                  <CardDescription>{researchPlan?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditingPlan ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editedPlanText}
                        onChange={(e) => setEditedPlanText(e.target.value)}
                        className="font-mono text-xs h-64"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditingPlan(false)}>
                          Cancel
                        </Button>
                        <Button onClick={savePlanEdits}>Save Changes</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {researchPlan?.steps.map((step) => (
                        <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                          <div className="mt-0.5">
                            {step.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            {step.status === "in-progress" && (
                              <Workflow className="h-5 w-5 text-blue-500 animate-pulse" />
                            )}
                            {step.status === "pending" && <Clock className="h-5 w-5 text-muted-foreground" />}
                            {step.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={resetResearch}>
                    Cancel Research
                  </Button>
                  <Button onClick={startResearch} disabled={isEditingPlan}>
                    Start Research
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {researchStage === "reasoning" && (
            <div className="max-w-3xl mx-auto">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Research in Progress</CardTitle>
                    <Button variant="outline" size="sm" onClick={togglePause}>
                      {isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    {isPaused
                      ? "Research paused. Click resume to continue."
                      : "Analyzing documents and gathering insights..."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{researchProgress}%</span>
                      </div>
                      <Progress value={researchProgress} className="h-2" />
                    </div>

                    <div className="space-y-4">
                      {reasoningSteps.map((step, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border transition-all duration-300",
                            index === currentReasoningStep
                              ? "border-primary/50 bg-primary/5"
                              : index < currentReasoningStep
                                ? "border-border bg-muted/20"
                                : "border-border/50 opacity-50",
                          )}
                        >
                          <div className="mt-0.5">
                            {index < currentReasoningStep && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            {index === currentReasoningStep && (
                              <div className="h-5 w-5 flex items-center justify-center">
                                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            {index > currentReasoningStep && <Clock className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={resetResearch} className="w-full">
                    Cancel Research
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {researchStage === "results" && (
            <div className="flex flex-col h-full">
              {/* Action buttons above table */}
              <div className="p-6 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => resetResearch()}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    New Research
                  </Button>
                  <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Documents
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleAddColumn}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="px-6 flex-1 overflow-auto">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("document")}
                            className="h-8 text-xs font-medium"
                          >
                            Document
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-[150px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("documentType")}
                            className="h-8 text-xs font-medium"
                          >
                            Document Type
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="min-w-[300px]">
                          <div className="text-xs font-medium">Highlights / Considerations</div>
                        </TableHead>
                        <TableHead className="min-w-[300px]">
                          <div className="text-xs font-medium">Target Customers</div>
                        </TableHead>
                        <TableHead className="w-[150px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("qualityScore")}
                            className="h-8 text-xs font-medium"
                          >
                            Quality Score
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        {customColumns.map((column) => (
                          <TableHead key={column.id} className="w-[200px]">
                            {column.isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  className="h-7 text-xs"
                                  value={column.name}
                                  onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                                  onBlur={() => handleFinishEditing(column.id)}
                                  onKeyDown={(e) => e.key === "Enter" && handleFinishEditing(column.id)}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div className="text-xs font-medium">{column.name}</div>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {row.document}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.documentType === "Regulatory Filing"
                                  ? "secondary"
                                  : row.documentType === "Presentation"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {row.documentType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <ul className="list-disc pl-4 space-y-1">
                              {row.highlights.map((highlight, index) => (
                                <li key={index} className="text-sm">
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </TableCell>
                          <TableCell>
                            <ul className="list-disc pl-4 space-y-1">
                              {row.targetCustomers.map((customer, index) => (
                                <li key={index} className="text-sm">
                                  {customer}
                                </li>
                              ))}
                            </ul>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.qualityScore === "High"
                                  ? "success"
                                  : row.qualityScore === "Medium"
                                    ? "warning"
                                    : "destructive"
                              }
                            >
                              {row.qualityScore}
                            </Badge>
                          </TableCell>
                          {customColumns.map((column) => (
                            <TableCell key={column.id}>
                              <div className="text-sm">{getPlaceholderData(row, column.id)}</div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Chat interface below table */}
              <div className="p-6 pt-4 border-t border-border mt-4">
                <div className="max-w-3xl mx-auto">
                  <div className="relative">
                    <Input
                      placeholder="Ask a question about this analysis..."
                      className="pr-24 py-3"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button size="sm" className="h-7 px-3">
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

