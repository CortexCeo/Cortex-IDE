"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Eye, EyeOff, Fingerprint, History, Settings, Star, User, Zap } from "lucide-react"

interface UserMemoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface MemoryItem {
  id: string
  type: string
  content: string
  timestamp: string
  confidence: number
  source: string
}

interface Preference {
  id: string
  category: string
  name: string
  value: string | number | boolean
  lastUpdated: string
}

export function UserMemoryPanel({ isOpen, onClose }: UserMemoryPanelProps) {
  const [activeTab, setActiveTab] = useState("memory")
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([])
  const [preferences, setPreferences] = useState<Preference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [previewInsights, setPreviewInsights] = useState(false)
  const [previewHistory, setPreviewHistory] = useState(false)

  // Simulate loading data
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)

      // Simulate API call
      setTimeout(() => {
        setMemoryItems([
          {
            id: "mem1",
            type: "interaction",
            content: "User prefers dark mode interfaces",
            timestamp: "2023-11-15T14:32:00Z",
            confidence: 0.92,
            source: "Settings interaction",
          },
          {
            id: "mem2",
            type: "query",
            content: "User frequently searches for React component patterns",
            timestamp: "2023-11-14T09:15:00Z",
            confidence: 0.87,
            source: "Search history",
          },
          {
            id: "mem3",
            type: "behavior",
            content: "User typically works between 9am-5pm EST",
            timestamp: "2023-11-13T18:45:00Z",
            confidence: 0.78,
            source: "Usage patterns",
          },
          {
            id: "mem4",
            type: "explicit",
            content: "User stated they prefer concise explanations",
            timestamp: "2023-11-10T11:20:00Z",
            confidence: 0.95,
            source: "Direct feedback",
          },
          {
            id: "mem5",
            type: "derived",
            content: "User has advanced knowledge of TypeScript",
            timestamp: "2023-11-08T16:30:00Z",
            confidence: 0.82,
            source: "Code analysis",
          },
        ])

        setPreferences([
          {
            id: "pref1",
            category: "Interface",
            name: "Color Theme",
            value: "Dark",
            lastUpdated: "2023-11-15T14:32:00Z",
          },
          {
            id: "pref2",
            category: "Communication",
            name: "Response Style",
            value: "Concise",
            lastUpdated: "2023-11-10T11:20:00Z",
          },
          {
            id: "pref3",
            category: "Technical",
            name: "Code Examples",
            value: "TypeScript",
            lastUpdated: "2023-11-08T16:30:00Z",
          },
          {
            id: "pref4",
            category: "Workflow",
            name: "Notifications",
            value: true,
            lastUpdated: "2023-11-05T09:45:00Z",
          },
          {
            id: "pref5",
            category: "Privacy",
            name: "Data Retention",
            value: "30 days",
            lastUpdated: "2023-11-01T10:15:00Z",
          },
        ])

        setIsLoading(false)
      }, 800)
    }
  }, [isOpen])

  const toggleInsightsPreview = () => {
    setPreviewInsights(!previewInsights)
  }

  const toggleHistoryPreview = () => {
    setPreviewHistory(!previewHistory)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] p-0 gap-0 bg-black/90 border border-white/10 text-white backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Neural Memory Interface</h2>
                <p className="text-sm text-white/60">Your personalized AI memory and preference center</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/5 text-white/80 border-white/10 px-2 py-1">
                <Zap className="w-3 h-3 mr-1" />
                <span className="text-xs">Cortex v2.4</span>
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="memory" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-white/10">
              <TabsList className="h-12 bg-transparent px-6">
                <TabsTrigger
                  value="memory"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-md"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Memory Traces
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-md"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-md"
                >
                  <Star className="w-4 h-4 mr-2" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-md"
                >
                  <History className="w-4 h-4 mr-2" />
                  Interaction History
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
              <TabsContent value="memory" className="mt-0 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Neural Memory Traces</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                    >
                      Manage Memory
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-blue-500 animate-spin" />
                      <p className="text-white/60">Accessing neural memory traces...</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {memoryItems.map((item) => (
                          <Card key={item.id} className="bg-white/5 border-white/10">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`
                                    px-2 py-1 text-xs
                                    ${item.type === "interaction" ? "bg-cyan-500/20 text-cyan-300" : ""}
                                    ${item.type === "query" ? "bg-blue-500/20 text-blue-300" : ""}
                                    ${item.type === "behavior" ? "bg-teal-500/20 text-teal-300" : ""}
                                    ${item.type === "explicit" ? "bg-indigo-500/20 text-indigo-300" : ""}
                                    ${item.type === "derived" ? "bg-sky-500/20 text-sky-300" : ""}
                                  `}
                                  >
                                    {item.type}
                                  </Badge>
                                  <span className="text-xs text-white/40">
                                    {new Date(item.timestamp).toLocaleDateString()} •
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-white/60">Confidence</span>
                                  <Progress value={item.confidence * 100} className="w-20 h-2 bg-white/10">
                                    <div
                                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                      style={{ width: `${item.confidence * 100}%` }}
                                    />
                                  </Progress>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <p className="text-white/80">{item.content}</p>
                              <p className="text-xs text-white/40 mt-2">Source: {item.source}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="mt-0 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">User Preferences</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                    >
                      Edit Preferences
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-blue-500 animate-spin" />
                      <p className="text-white/60">Loading preference data...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      {["Interface", "Communication", "Technical", "Workflow", "Privacy"].map((category) => {
                        const categoryPrefs = preferences.filter((p) => p.category === category)
                        return (
                          <Card key={category} className="bg-white/5 border-white/10">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-md font-medium">{category} Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <div className="space-y-3">
                                {categoryPrefs.map((pref) => (
                                  <div key={pref.id} className="flex justify-between items-center">
                                    <span className="text-white/70">{pref.name}</span>
                                    <Badge className="bg-white/10 text-white hover:bg-white/20">
                                      {typeof pref.value === "boolean"
                                        ? pref.value
                                          ? "Enabled"
                                          : "Disabled"
                                        : pref.value.toString()}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="mt-0 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">AI Insights</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        Coming Soon
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 flex items-center gap-1"
                        onClick={toggleInsightsPreview}
                      >
                        {previewInsights ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Hide Preview
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    {!previewInsights && (
                      <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-pointer transition-all duration-300"
                        onClick={toggleInsightsPreview}
                      >
                        <div className="text-center max-w-md p-6">
                          <Star className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-70" />
                          <h3 className="text-lg font-medium mb-2">AI Insights Coming Soon</h3>
                          <p className="text-white/70">
                            Our neural networks are still learning about your preferences and behaviors. Check back soon
                            for personalized AI insights.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Click to Preview
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className={`grid grid-cols-2 gap-6 ${previewInsights ? "opacity-100" : "opacity-20"}`}>
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-md font-medium">Productivity Patterns</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-3">
                            <p className="text-white/70">
                              Based on your usage patterns, you're most productive between 9am-11am.
                            </p>
                            <div className="h-32 w-full bg-white/5 rounded-md flex items-end justify-between p-2">
                              {[0.2, 0.5, 0.9, 0.7, 0.3, 0.6, 0.4].map((value, i) => (
                                <div
                                  key={i}
                                  className="w-8 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-sm"
                                  style={{ height: `${value * 100}%` }}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-white/40">Productivity score by hour of day</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-md font-medium">Learning Trajectory</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-3">
                            <p className="text-white/70">Your knowledge in these areas has grown significantly:</p>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>TypeScript</span>
                                  <span>Advanced</span>
                                </div>
                                <Progress value={85} className="h-2 bg-white/10" />
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>React</span>
                                  <span>Expert</span>
                                </div>
                                <Progress value={92} className="h-2 bg-white/10" />
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Next.js</span>
                                  <span>Intermediate</span>
                                </div>
                                <Progress value={68} className="h-2 bg-white/10" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Interaction History</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        Coming Soon
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 flex items-center gap-1"
                        onClick={toggleHistoryPreview}
                      >
                        {previewHistory ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Hide Preview
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    {!previewHistory && (
                      <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-pointer transition-all duration-300"
                        onClick={toggleHistoryPreview}
                      >
                        <div className="text-center max-w-md p-6">
                          <History className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-70" />
                          <h3 className="text-lg font-medium mb-2">Interaction History</h3>
                          <p className="text-white/70">
                            Your interaction history will be available here. This feature is currently being developed.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Click to Preview
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className={`space-y-4 ${previewHistory ? "opacity-100" : "opacity-20"}`}>
                      {[
                        {
                          time: "Today, 10:23 AM",
                          query: "How do I implement authentication in Next.js?",
                          type: "Question",
                        },
                        {
                          time: "Today, 9:45 AM",
                          query: "Generate a React component for a dashboard",
                          type: "Generation",
                        },
                        { time: "Yesterday, 4:12 PM", query: "Debug my API route handler", type: "Debugging" },
                        { time: "Yesterday, 2:30 PM", query: "Explain how useContext works", type: "Explanation" },
                        { time: "Mar 12, 11:05 AM", query: "Convert this CSS to Tailwind", type: "Conversion" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                            <History className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white/40">{item.time}</span>
                              <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30">{item.type}</Badge>
                            </div>
                            <p className="text-white/80">{item.query}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/60">Memory retention: 30 days</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                onClick={onClose}
              >
                Close Interface
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

