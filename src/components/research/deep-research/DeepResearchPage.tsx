"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Clock,
  BookOpen,
  FileText,
  ClipboardCheck,
  HourglassIcon, 
  Globe,
  FolderPlus,
  FolderOpen,
  Check,
  Database,
  BarChart,
  Microscope,
  Send,
  Paperclip,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Bookmark,
  Share2,
  MoreHorizontal,
  Filter,
  Settings,
  History,
  Layers,
  PlusCircle,
  Download,
  Printer,
  Mail,
  CheckCircle2,
  AlertCircle,
  Edit,
  Play,
  Pause,
  ArrowRight,
  Workflow,
  Folder,
  Trash2,
  X as XIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ResearchResults, SourcesDisplay } from "./RenderResearchReport"
import { createDeepResearch, continueDeepResearch } from "@/services/deep-research"
import { initializeProjects, ProjectData, ResearchItem } from "./initialize"
import { USER_ID } from "@/config/user"
import { getDeepResearchById, deleteDeepResearchById} from "./functions"
import { getDeepResearchTypes } from "./functions"
import { ResearchHistory } from './rendering'

interface DeepResearchPageProps {
  onClose: () => void
}

// Research flow stages
export type ResearchStage = "to_be_started" | "in_planning" | "in_progress" | "completed"

// Research plan type
export interface ResearchPlan {
  topic: string
  description: string
  steps: {
    title: string
    description: string
    web_search: boolean
    internal_search: boolean
    status: "pending"
  }[]
}

interface Source {
  title: string
  url?: string
}

// Research source type
interface ResearchSource {
  index: number | string
  segment_text: string
  confidence_scores: number[]
  sources: Source[]
}

export interface SectionSources {
  name: string
  sources: ResearchSource[]
}

export function DeepResearchPage({ onClose }: DeepResearchPageProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [researchTopics, setResearchTopics] = useState<Array<{id: string, name: string, date: string, count: number, items?: ResearchItem[], expanded?: boolean}>>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(330) // Default width (64 * 4 = 256px)
  const [isResizing, setIsResizing] = useState(false)
  const [showHistoryView, setShowHistoryView] = useState(false)
  
  // Projects data as state variable with research counts
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [pendingResearch, setPendingResearch] = useState<ResearchItem[]>([])

  // Research flow state
  const [researchStage, setResearchStage] = useState<ResearchStage>("to_be_started")
  const [researchPlan, setResearchPlan] = useState<ResearchPlan | null>(null)
  const [reportId, setReportId] = useState("")
  const [researchProgress, setResearchProgress] = useState(0)
  const [sources, setSources] = useState<SectionSources[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [conversation_id, setConversationId] = useState<string>("")
  const [reportData, setReportData] = useState("")
  
  /**
   * Helper function to clean markdown code blocks from text
   * @param text The text to clean
   * @returns Cleaned text without markdown code block syntax
   */
  const cleanMarkdownCodeBlocks = (text: string | undefined): string => {
    if (!text) return '';
    
    // Remove ```markdown, ```text, or any other ```language tags
    let cleaned = text.replace(/```(markdown|text|\w+)?\n/g, '');
    
    // Remove closing ``` tags
    cleaned = cleaned.replace(/```/g, '');
    
    return cleaned.trim();
  }
  
  /**
   * Helper method to map API response to ResearchPlan format
   * @param response The API response containing plan data
   * @param currentTopic Optional current topic to use if response doesn't have one
   * @returns Mapped ResearchPlan object
   */
  const mapResponseToPlan = (response: any, currentTopic?: string): ResearchPlan => {
    return {
      topic: response.topic || currentTopic || 'Research Topic',
      description: response.description || 'Research Description',
      steps: Array.isArray(response.plan) ? response.plan.map((step: any) => ({
        title: step.name || '',
        description: step.description || '',
        web_search: step.research !== undefined ? step.research : true,
        internal_search: step.internal_search !== undefined ? step.internal_search : false,
        status: 'pending'
      })) : []
    }
  }

  const mapResponseToSources = (response: any): SectionSources[] => {
    if (!response || !Array.isArray(response)) return [];
    
    return response
      .filter((section: any) => {
        // Filter out sections with empty sources
        return section.sources && 
               Array.isArray(section.sources) && 
               section.sources.length > 0;
      })
      .map((section: any) => ({
        name: section.section_name,
        sources: section.sources
      }));
  }

  const buildResearchTopic = (types: string[], projects: ProjectData[]): any[] => {
    // Create a map to store research items by type
    const typeMap = new Map<string, {
      items: ResearchItem[];
      latestDate: Date;
    }>();
    
    // Initialize the map with all available types
    types.forEach(type => {
      typeMap.set(type, {
        items: [],
        latestDate: new Date(0) // Start with epoch time
      });
    });
    
    // Iterate through all projects and their items
    projects.forEach(project => {
      if (project.items) {
        project.items.forEach(item => {
          // Check if the item has a type property
          if (item.type) {
            // Get or create entry for this type
            const typeData = typeMap.get(item.type) || {
              items: [],
              latestDate: new Date(0)
            };
            
            // Add this item to the type's items list
            typeData.items.push(item);
            
            // Update latest date if this item is newer
            if (item.created_at) {
              const itemDate = new Date(item.created_at);
              if (itemDate > typeData.latestDate) {
                typeData.latestDate = itemDate;
              }
            }
            
            // Update the map
            typeMap.set(item.type, typeData);
          }
        });
      }
    });
    
    // Convert map to the required output format
    return Array.from(typeMap.entries())
      .filter(([_, data]) => data.items.length > 0) // Only include types that have items
      .map(([type, data], index) => {
        // Calculate relative date string
        const dateStr = formatRelativeDate(data.latestDate);
        
        return {
          id: `topic-${index + 1}`,
          name: type,
          date: dateStr,
          count: data.items.length,
          items: data.items,
          expanded: false
        };
      });
  }
  
  const buildPendingResearch = (projects: ProjectData[]): ResearchItem[] => {
    // Create array to store pending research items
    const pendingItems: ResearchItem[] = [];
    
    // Iterate through all projects
    projects.forEach(project => {
      if (project.items) {
        // Filter for items with status 'in_planning' or 'in_progress'
        const inProgressItems = project.items.filter(item => 
          item.status === 'in_planning' || item.status === 'in_progress'
        );
        
        // Add these items to our pending items array
        pendingItems.push(...inProgressItems);
      }
    });
    
    // Sort by updated_at date if available (most recent first)
    pendingItems.sort((a, b) => {
      if (a.updated_at && b.updated_at) {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return 0;
    });
    
    return pendingItems;
  }
  // Helper function to format a date relative to now (e.g., "2 days ago")
  const formatRelativeDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 14) {
      return "1 week ago";
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 60) {
      return "1 month ago";
    } else {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
  }
  
  /**
   * Helper function to extract all research items from all projects
   */
  const getAllResearchItems = (projectsArray: ProjectData[]): ResearchItem[] => {
    const allItems: ResearchItem[] = [];
    
    projectsArray.forEach(project => {
      if (project.items) {
        allItems.push(...project.items);
      }
    });
    
    return allItems;
  }
  
  // Method to handle deleting a research item
  const handleDeleteResearch = async (item: ResearchItem, e: React.MouseEvent) => {
    // Stop event propagation to prevent triggering the parent button click
    e.stopPropagation()
    
    // Confirm deletion with the user
    if (!window.confirm(`Are you sure you want to delete "${item.topic}"?`)) {
      return
    }
    
    // Check if _id or id exists before deleting
    if (!item._id && !item.id) {
      console.error('Research item has no ID')
      return
    }
    
    // Use _id if available, otherwise use id
    const itemId = item._id || item.id
    const success = await deleteDeepResearchById(itemId as string)
    
    if (success) {
      // Refresh the projects list after deletion
      const updatedProjects = await initializeProjects(USER_ID)
      setProjects(updatedProjects)
    } else {
      alert('Failed to delete the research item. Please try again.')
    }
  }
  
  // Method to handle research item selection
  const handleResearchItemClick = async (item: ResearchItem) => {
    console.log('Clicked research item:', item)
    
    // Check if _id or id exists before fetching
    if (!item._id && !item.id) {
      console.error('Research item has no ID')
      return
    }
    
    // Use _id if available, otherwise use id
    const itemId = item._id || item.id
    let research: ResearchItem | null = null  
    console.log('Research item status:', item.status)
    if (item.status === 'in_planning') {
      research = await getDeepResearchById(itemId as string)
    } else {
      research = item
    }
    
    // Set the report ID
    if (research && research._id) {
      setReportId(research._id)
    } else if (research && research.id) {
      setReportId(research.id)
    }
    
    // Set the research stage based on item status
    if (item.status) {
      // Convert the status to ResearchStage type if possible
      const itemStatus = item.status.toLowerCase()
      if (
        itemStatus === 'to_be_started' || 
        itemStatus === 'in_planning' || 
        itemStatus === 'in_progress' || 
        itemStatus === 'completed'
      ) {
        setResearchStage(itemStatus as ResearchStage)
      }
    }
    
    // If there's a plan, set it
    if (item.description) {
      // Create a basic research plan from the item data
      const newPlan = mapResponseToPlan(item, item.topic)
      setResearchPlan(newPlan)
    }

    setReportData(cleanMarkdownCodeBlocks(item.report))
    const mappedSources = mapResponseToSources(item.sources)
    setSources(mappedSources)
    setInsights(item.insights || [])

    // Map the project ID with the existing project array and set selectedProject
    if (item.project_id) {
      const matchingProject = projects.find(project => project.id === item.project_id);
      if (matchingProject) {
        setSelectedProject(matchingProject);
      }
    }
    
    // Set active tab to chat
    setActiveTab('chat')
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  /**
   * Initialize all data for the DeepResearchPage component
   * This method sets up default values for all state variables and fetches data from APIs
   */
  /**
   * Fetches and processes research data from the API
   */
  const fetchResearchData = async () => {
    try {
      // Use the initializeProjects method to fetch and organize project data
      const projectsArray = await initializeProjects(USER_ID);
      const researchTypes = await getDeepResearchTypes(USER_ID);
      
      // If we found any projects, update the state
      if (projectsArray.length > 0) {
        console.log('Projects data:', projectsArray);
        setProjects(projectsArray);
        // Set the first project as selected by default
        setSelectedProject(projectsArray[0]);
        
        // Process research topics based on types and project data
        if (researchTypes && researchTypes.length > 0) {
          const topicsData = buildResearchTopic(researchTypes, projectsArray);
          setResearchTopics(topicsData);
        }
        
        // Find pending research items (in_planning or in_progress)
        const pendingItems = buildPendingResearch(projectsArray);
        setPendingResearch(pendingItems);
      } else {
        // Fallback to empty array if no projects found
        setProjects([]);
        setResearchTopics([]);
      }
    } catch (error) {
      console.error("Error initializing projects:", error);
      // Fallback to empty array if there's an error
      setProjects([]);
    }
  }

  const resetChat = () => {
    // Initialize welcome message
    setMessages([
      {
        id: "welcome",
        type: "system",
        content: "Welcome to Deep Research. Ask complex questions and get comprehensive answers with sources.",
          },
        ])

    // Reset research flow state
    setResearchStage("to_be_started")
    setResearchPlan(null)
    setReportId("")
    setResearchProgress(0)
    setSources([])
    setInsights([])
    setConversationId("")
    
    // Reset UI state
    setActiveTab("chat")
    setInputValue("")
    setIsLoading(false)
  }

  const initData = useCallback(async () => {
    
    // Fetch research data
    await fetchResearchData();
    
    // Reset chat
    resetChat();

    setIsSidebarCollapsed(false)
    setSidebarWidth(330)
    setIsResizing(false)
    setShowHistoryView(false)
    
    // Load any saved data from localStorage or API if needed
    // This could be implemented in the future to restore user session
  }, [])

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await initData();
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    
    loadData();
  }, [initData])
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Example research query
  const exampleQuery = "What are the emerging trends in renewable energy investments for 2025?"

  // Handle sending a message or research query
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    if (researchStage === "in_planning") {
      setInputValue("")
      setIsLoading(true)
      if (!selectedProject) {
        console.error("No project selected");
        setIsLoading(false)
        return
      }
      const response = await continueDeepResearch(USER_ID, selectedProject.name, reportId, {
        feedback: inputValue,
      })
      setIsLoading(false)
          
      // Map the plan response to the ResearchPlan interface using helper method
      const mappedPlan = mapResponseToPlan(response, researchPlan?.topic)
      
      setResearchPlan(mappedPlan)
    }  
    else {  
      // Add user message
      const userMessage = {
        id: `msg-${Date.now()}-user`,
        type: "user",
        content: inputValue,
        timestamp: new Date(),
      }

    setMessages((prev) => [...prev, userMessage])

    // If this is a research query, start the research flow
    if (activeTab === "chat") {
      setInputValue("")
      setIsLoading(true)

      // Call the API to create a deep research
      try {
        const userId = USER_ID
        const projectId = selectedProject?.id
        
        console.log('Sending request with conversation_id:', conversation_id);
        const response = await createDeepResearch(userId, projectId!, {
          message: inputValue,
          conversation_id: conversation_id
        })
        
        // Handle different response types
        if (response.type === "plan") {
          // It's a research plan
          setResearchStage("in_planning")
          
          // Map the plan response to the ResearchPlan interface using helper method
          const mappedPlan = mapResponseToPlan(response, researchPlan?.topic)
          
          setResearchPlan(mappedPlan)
          setReportId(response.report_id)
          await fetchResearchData();
        } else if (response.type === "cortex") {
          // It's a direct message response
          const aiMessage = {
            id: `msg-${Date.now()}-ai`,
            type: "ai",
            content: response.reply,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, aiMessage])
          // Save the conversation ID for future messages
          setConversationId(response.conversation_id)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error creating deep research:", error)
        const errorMessage = {
          id: `msg-${Date.now()}-system`,
          type: "system",
          content: "Sorry, there was an error processing your request. Please try again.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setIsLoading(false)
      }
    } 
    }
  }

  // Start the research execution after plan is confirmed
  const startResearch = async () => {
    if (!researchPlan) return
    if (!selectedProject) {
      console.error("No project selected");
      return
    }
    await continueDeepResearch(USER_ID, selectedProject.name, reportId, {
      feedback: true
    })  
    setResearchStage("in_progress")
    await fetchResearchData();
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Handle sidebar resize
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    
    // Calculate new width based on mouse position
    const newWidth = e.clientX
    
    // Set minimum and maximum width constraints
    if (newWidth >= 200 && newWidth <= 500) {
      setSidebarWidth(newWidth)
    }
  }, [isResizing])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Set up and clean up event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', stopResizing)
      // Add a timeout to automatically stop resizing if mouse is released outside the window
      const safetyTimeout = setTimeout(() => {
        if (isResizing) stopResizing()
      }, 5000)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', stopResizing)
        clearTimeout(safetyTimeout)
      }
    }
  }, [isResizing, handleMouseMove, stopResizing])

  // Render the research plan UI
  const renderResearchPlan = () => {
    if (!researchPlan) return null

    return (
      <div className="max-w-5xl mx-auto w-full">
        <Card className={cn("h-[70vh] flex flex-col w-full", isLoading && "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent before:animate-shimmer before:bg-[length:200%_100%]")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{researchPlan.topic}</CardTitle>
            </div>
            <CardDescription>{researchPlan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
              {researchPlan.steps.map((step) => (
                <div key={step.title} className={cn(
                  "flex min-h-[8vh] items-start gap-3 p-3 rounded-lg border border-border",
                  isLoading && "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent before:animate-shimmer before:bg-[length:200%_100%]"
                )}>
                  <div className="mt-0.5">
                    {isLoading ? (
                      <div className="h-5 w-5 flex items-center justify-center">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      step.status === "pending" && <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{step.title}</h4>
                      <div className="flex gap-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          step.internal_search 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" 
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 opacity-70"
                        )}>
                          Internal
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full", 
                          step.web_search 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 opacity-70"
                        )}>
                          Online
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 w-[90%]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={startResearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start Research
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Effect to poll for research status updates when in progress
  useEffect(() => {
    // Only poll when research is in progress and we have a report ID
    if (researchStage === "in_progress" && reportId) {
      let pollingInterval: NodeJS.Timeout;
      
      // Import the getDeepResearchById function
      import('./functions').then(({ getDeepResearchById }) => {
        // Define the polling function
        const pollResearchStatus = async () => {
          try {
            console.log(`Polling research status for ID: ${reportId}`);
            const research = await getDeepResearchById(reportId);
            
            if (research) {
              console.log(`Research status: ${research.status}`);
              // Update progress based on research status
              if (research.status === "completed") {
                setResearchProgress(100);
                setResearchStage("completed");
                setReportData(cleanMarkdownCodeBlocks(research.report))
                setSources(mapResponseToSources(research.sources))
                setInsights(research.insights || [])
                await fetchResearchData();
                // Clear the interval when research is complete
                clearInterval(pollingInterval);
              } else if (research.status === "in_progress") {
                // Calculate progress based on time (10 seconds per plan item)
                if (research.plan && research.plan.length > 0) {
                  // Use created_at as the start time
                  if (!research.created_at) {
                    // If no creation time is recorded, we can't calculate progress
                    setResearchProgress(5); // Start with 5%
                  } else {
                    const totalSteps = research.plan.length;
                    const totalTimeNeeded = totalSteps * 30; // 30 seconds per step
                    
                    // Calculate elapsed time in seconds
                    const createdAt = new Date(research.created_at as string);
                    const startTime = createdAt.getTime();
                    const currentTime = new Date().getTime();
                    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
                    
                    // Calculate progress percentage based on elapsed time
                    let progress = Math.round((elapsedSeconds / totalTimeNeeded) * 100);
                    
                    // Cap progress at 90% until research is actually complete
                    progress = Math.min(progress, 90);
                    
                    setResearchProgress(progress);
                  }
                }
              }
            } else {
              // If research is not found, increment progress artificially
              // This provides feedback to the user even if the API can't find the report yet
              setResearchProgress(prev => {
                // Increment by 5% up to 60% max as a fallback
                const newProgress = Math.min(prev + 5, 60);
                return newProgress;
              });
            }
          } catch (error) {
            console.error("Error polling research status:", error);
            // Even on error, increment progress slightly to show something is happening
            setResearchProgress(prev => Math.min(prev + 2, 60));
          }
        };
        
        // Poll immediately once
        pollResearchStatus();
        
        // Set up polling interval (every 5 seconds)
        pollingInterval = setInterval(pollResearchStatus, 5000);
      });
      
      // Clean up interval on unmount or when research stage changes
      return () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    }
  }, [researchStage, reportId]);

  // Render the reasoning process UI
  const renderReasoningProcess = () => {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <Card className="mb-6 flex flex-col w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Research in Progress</CardTitle>
            </div>
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
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render the main research content based on current stage
  const renderResearchContent = () => {
    switch (researchStage) {
      case "in_planning":
        return renderResearchPlan()
      case "in_progress":
        return renderReasoningProcess()
      case "completed":
        return <ResearchResults report_data={reportData} sources={sources} setActiveTab={setActiveTab} />
      default:
        return (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === "user" ? "justify-end" : "justify-start",
                  message.type === "system" && "justify-center",
                )}
              >
                {message.type === "system" ? (
                  <Card className="w-full max-w-2xl bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Microscope className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : message.type === "user" ? (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="bg-primary/10 rounded-lg px-4 py-3 text-sm">
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-green-500/10 text-green-500">AI</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="bg-card rounded-lg px-4 py-3 text-sm shadow-sm">
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>

                      {message.sources && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-medium text-muted-foreground ml-1">Sources:</p>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source: any, index: number) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1 py-1">
                                <span>{source.title}</span>
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                              Helpful
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                              Not Helpful
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <Bookmark className="h-3.5 w-3.5 mr-1" />
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <Share2 className="h-3.5 w-3.5 mr-1" />
                              Share
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-green-500/10 text-green-500">AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-card rounded-lg px-4 py-3 text-sm shadow-sm flex items-center">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )
    }
  }

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar */}
      <div
        className={cn(
          "border-r border-border flex flex-col relative",
          isSidebarCollapsed ? "w-0 overflow-hidden" : "",
        )}
        style={{ width: isSidebarCollapsed ? 0 : `${sidebarWidth}px` }}
      >
        {/* Resize handle */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-10 transition-colors",
            isResizing ? "bg-primary" : "hover:bg-primary/30"
          )}
          onMouseDown={startResizing}
        />
        {isResizing && (
          <div className="fixed inset-0 z-50 cursor-col-resize" />
        )}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Deep Research</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive research assistant</p>
        </div>

        {/* <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search research..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div> */}
        <div className="px-3">
          <Button variant="outline" className="w-full justify-center text-sm h-9 px-2 mt-2 text-primary" onClick={resetChat}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Research Topic
          </Button>
        </div>
         

        {projects.length > 0 ? (
          showHistoryView ? (
            // Show the research history view that groups by time periods
            <ResearchHistory 
              items={getAllResearchItems(projects)}
              onBackClick={() => setShowHistoryView(false)}
              onItemClick={handleResearchItemClick}
              onDeleteItem={handleDeleteResearch}
            />
          ) : (
            // Show the normal view with projects and topics
            <ScrollArea className="flex-1">
              <div className="p-3">
            <div className="mb-6">
              <h3 className="text-base font-medium mb-3 px-2">Projects</h3>
              <div className="space-y-1">
                {projects.map((project) => (
                  <div key={project.id}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm h-9 px-2"
                      onClick={() => {
                        // Toggle expanded state for this project
                        setProjects(prevProjects => 
                          prevProjects.map(p => 
                            p.id === project.id 
                              ? { ...p, expanded: !p.expanded } 
                              : p
                          )
                        );
                      }}
                    >
                      {project.expanded ? 
                        <ChevronDown className="h-4 w-4 mr-2 text-primary" /> : 
                        <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                      }
                      <div className="flex-1 flex flex-col items-start">
                        <span>{project.name}</span>
                      </div>
                      <div className="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {project.count}
                      </div>
                    </Button>
                    
                    {/* Show research items when project is expanded */}
                    {project.expanded && project.items && project.items.length > 0 && (
                      <div className="pl-6 space-y-1 mt-1 mb-2">
                        {project.items.map((item) => (
                          <div key={item._id || item.id} className="flex items-center group">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-sm h-8 px-2 overflow-hidden group-hover:pr-8"
                              title={item.topic} /* Add tooltip to show full name on hover */
                              onClick={() => handleResearchItemClick(item)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-muted-foreground" />
                              <span className="truncate max-w-[13vw] overflow-hidden text-ellipsis whitespace-nowrap">{item.topic}</span>
                            </Button>
                            <button 
                              className="opacity-0 group-hover:opacity-100 absolute right-2 p-1 rounded-full hover:bg-destructive/10 transition-opacity"
                              title="Delete research"
                              onClick={(e) => handleDeleteResearch(item, e)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {researchTopics.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-base font-medium mb-3 px-2">Research Topics</h3>
                <div className="space-y-3">
                  {researchTopics.map((topic) => (
                  <div key={topic.id}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm h-9 px-2"
                      onClick={() => {
                        // Toggle expanded state for this topic
                        setResearchTopics(prevTopics => 
                          prevTopics.map(t => 
                            t.id === topic.id 
                              ? { ...t, expanded: !t.expanded } 
                              : t
                          )
                        );
                      }}
                    >
                      <div className="flex items-center">
                        {topic.expanded ? 
                          <ChevronDown className="h-4 w-4 mr-1 text-primary" /> : 
                          <ChevronRight className="h-4 w-4 mr-1 text-primary" />
                        }
                        <Layers className="h-4 w-4 mr-2 text-primary" />
                      </div>
                      <div className="flex-1 flex flex-col items-start">
                        <span>{topic.name}</span>
                        <span className="text-xs text-muted-foreground">{topic.date}</span>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {topic.count}
                      </Badge>
                    </Button>
                    
                    {/* Show research items when topic is expanded */}
                    {topic.expanded && topic.items && topic.items.length > 0 && (
                      <div className="pl-6 space-y-1 mt-1 mb-2">
                        {topic.items.map((item) => (
                          <div key={item._id || item.id} className="flex items-center group">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-sm h-8 px-2 overflow-hidden group-hover:pr-8"
                              title={item.topic} /* Add tooltip to show full name on hover */
                              onClick={() => handleResearchItemClick(item)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-muted-foreground" />
                              <span className="truncate max-w-[13vw] overflow-hidden text-ellipsis whitespace-nowrap">{item.topic}</span>
                            </Button>
                            <button 
                              className="opacity-0 group-hover:opacity-100 absolute right-2 p-1 rounded-full hover:bg-destructive/10 transition-opacity"
                              title="Delete research"
                              onClick={(e) => handleDeleteResearch(item, e)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              </div>
            ) : null}

            {pendingResearch.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-base font-medium mb-3 px-2">Pending Research</h3>
                <div className="space-y-3 mt-1 mb-2">
                  {pendingResearch.map((item) => (
                    <div key={item._id || item.id} className="flex items-center group">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm h-10 px-2 overflow-hidden group-hover:pr-8"
                        title={item.topic} /* Add tooltip to show full name on hover */
                        onClick={() => handleResearchItemClick(item)}
                      >
                        {item.status === 'in_planning' ? (
                          <ClipboardCheck className="h-4 w-4 mr-2 text-amber-500" />
                        ) : (
                          <HourglassIcon className="h-4 w-4 mr-2 text-blue-500" />
                        )}
                        <div className="flex-1 flex flex-col items-start">
                          <span className="truncate max-w-[13vw] overflow-hidden text-ellipsis whitespace-nowrap">{item.topic}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.status === 'in_planning' ? 'Planning' : 'In Progress'}
                          </span>
                        </div>
                      </Button>
                      <button 
                        className="opacity-0 group-hover:opacity-100 absolute right-2 p-1 rounded-full hover:bg-destructive/10 transition-opacity"
                        title="Delete research"
                        onClick={(e) => handleDeleteResearch(item, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
              </div>
            </ScrollArea>
          )
        ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <FolderPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Projects Found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              You don't have any research projects yet. Use the project dropdown above to create your first project.  
            </p>
          </div>
        </div>
        )}

        <div className="p-3 border-t border-border">
          {showHistoryView ? (
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => setShowHistoryView(false)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Research
          </Button>
          ) :(
            <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => setShowHistoryView(true)}
          >
            <History className="h-4 w-4 mr-2" />
            Research History
          </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header and Tabs Navigation */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {isSidebarCollapsed && (
                <Button variant="ghost" size="icon" className="mr-2" onClick={toggleSidebar}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <Microscope className="h-5 w-5 mr-2 text-primary" />
              <h1 className="text-xl font-semibold">Cortex Deep Research</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={researchStage !== "to_be_started"}>
                  {selectedProject ? (
                    <>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      {selectedProject.name}
                    </>
                  ) : projects.length > 0 ? (
                    <>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      {projects[0]?.name || "Select Project"}
                    </>
                  ) : (
                    <>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <DropdownMenuItem 
                      key={project.id} 
                      className="flex items-center cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{project.name}</span>
                      {selectedProject?.id === project.id && (
                        <Check className="h-4 w-4 ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer"
                    onClick={() => {
                      // Here you would implement project creation logic
                      const projectName = prompt('Enter project name:')
                      if (projectName) {
                        // This is a placeholder - in a real app, you would call an API
                        const newProject: ProjectData = {
                          id: `project-${Date.now()}`,
                          name: projectName,
                          count: 0,
                          items: []
                        }
                        setProjects([...projects, newProject])
                        setSelectedProject(newProject)
                      }
                    }}
                  >
                    <FolderPlus className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Create New Project</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Tabs navigation */}
        <div className="border-b border-border px-4">
          <div className="w-full">
            <div className="grid w-full grid-cols-3">
              <button 
                className={`flex items-center justify-center py-2 px-4 ${activeTab === "chat" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button 
                className={`flex items-center justify-center py-2 px-4 ${activeTab === "sources" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("sources")}
              >
                Sources
              </button>
              <button 
                className={`flex items-center justify-center py-2 px-4 ${activeTab === "insights" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("insights")}
              >
                Insights
              </button>
            </div>
          </div>
        </div>
          
        {/* Tab content area - controlled by state */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col p-0 m-0 h-full">
              {/* Scrollable chat content area */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4">{renderResearchContent()}</ScrollArea>
              </div>

              {/* Fixed chat input at bottom */}
              {(researchStage === "to_be_started" || researchStage === "in_planning") && (
                <div className="p-4 border-t border-border mt-auto">
                  <div className="max-w-3xl mx-auto">
                    <div className="relative">
                      <Input
                        placeholder={researchStage === "to_be_started" ? (messages.length === 1 ? exampleQuery : "") : "Feedback (optional)"}
                        className="pr-24 py-6 text-base"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {/* <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </Button> */}
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Deep Research uses multiple sources to provide comprehensive answers. Results may require
                      verification.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "sources" && (
            <div className="flex-1 pt-3 px-6 flex flex-col h-full overflow-auto justify-start">
              <h2 className="text-lg font-semibold mb-4">Research Sources</h2>
              <p className="text-muted-foreground mb-6">View and manage the sources used in your research.</p>

              {sources.length > 0 ? (
                <div className="p-4">
                  <SourcesDisplay sources={sources} />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Sources will appear here</CardTitle>
                    <CardDescription>Start a research conversation to see sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">No sources available yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "insights" && (
            <div className="flex-1 pt-3 px-6 flex flex-col h-full overflow-auto justify-start">
              <h2 className="text-lg font-semibold mb-4">Research Insights</h2>

              {insights.length > 0 ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                      <CardDescription>
                        AI-generated insights based on comprehensive analysis of multiple sources
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center mt-0.5">
                              <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                            </div>
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    {/* <CardFooter>
                      <Button variant="outline" size="sm" className="ml-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Export Insights
                      </Button>
                    </CardFooter> */}
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Insights will appear here</CardTitle>
                    <CardDescription>Start a research conversation to generate insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">No insights available yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
