"use client"
import { useState } from "react"
import { Brain, History, X, Send, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Paperclip, Mic } from "lucide-react"
import { ChatHistory } from "@/components/chat/ChatHistory"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SideChat() {
  const [isOpen, setIsOpen] = useState(true)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [inputValue, setInputValue] = useState("")

  if (!isOpen) {
    return (
      <Button
        variant="default"
        size="icon"
        className="h-12 w-12 fixed right-4 bottom-4 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Brain className="h-6 w-6" />
      </Button>
    )
  }

  if (showChatHistory) {
    return <ChatHistory onClose={() => setShowChatHistory(false)} />
  }

  return (
    <div className="w-[380px] border-l border-border bg-background/50 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-4 h-14 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">Cortex AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowChatHistory(true)}>
            <History className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Clear conversation</DropdownMenuItem>
              <DropdownMenuItem>Export chat</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-6">
          {/* System Message */}
          <div className="bg-muted/20 rounded-lg p-3.5 text-sm border border-border/50">
            <p className="text-muted-foreground leading-relaxed">
              I'm Cortex Copilot, your AI assistant for financial analysis. I can help with spreadsheets, documents, and
              code. What would you like to do with your current file?
            </p>
          </div>

          {/* User Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-primary">JD</span>
            </div>
            <div className="bg-primary/5 rounded-lg px-4 py-3 text-sm max-w-[85%]">
              <p>Can you analyze the growth rates in my spreadsheet?</p>
            </div>
          </div>

          {/* Assistant Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Brain className="h-4 w-4 text-green-500" />
            </div>
            <div className="bg-card rounded-lg px-4 py-3 text-sm max-w-[85%] shadow-sm">
              <p className="mb-2">I've analyzed the growth rates in your spreadsheet:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>
                    Alpha Corp: <span className="text-green-500 font-medium">12.5%</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <span>
                    Beta Inc: <span className="text-yellow-500 font-medium">8.3%</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>
                    Gamma LLC: <span className="text-green-500 font-medium">15.2%</span>
                  </span>
                </li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Gamma LLC has the highest growth rate at 15.2%, but remember it also has the highest risk rating.
              </p>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Suggested Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
                Compare with industry averages
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
                Create growth chart
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
                Risk-adjusted analysis
              </Button>
              <Badge variant="outline" clickable className="cursor-pointer">
                New Analysis
              </Badge>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="relative">
          {/* Input Field */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="pr-12"
              variant="chat"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10">
                <Mic className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-full",
                  "bg-primary/10 hover:bg-primary/20 text-primary",
                  "transition-all duration-200",
                  !inputValue.trim() && "opacity-50 cursor-not-allowed",
                )}
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

