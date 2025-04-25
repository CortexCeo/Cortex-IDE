import React, { useState } from 'react';
import { ChevronDown, Settings, Maximize2, Minimize2, HelpCircle, Bot, Info, X, Wand2, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AgentHeaderProps {
  title?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onOpenSettings?: () => void;
  onHelp?: () => void;
  projectId?: string;
  backUrl?: string;
}

const AgentHeader: React.FC<AgentHeaderProps> = ({
  title = 'Maestro Agent',
  isExpanded = true,
  onToggleExpand,
  onOpenSettings,
  onHelp,
  projectId,
  backUrl = '/maestro'
}) => {
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  return (
    <div className="relative">
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        "bg-black text-white",
        "border-border/60 shadow-sm"
      )}>
        <div className="flex items-center space-x-3">
          <Link href={backUrl} className={cn(
            "p-1.5 rounded-full transition-colors",
            "hover:bg-white/10 text-gray-300 hover:text-white"
          )}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            "bg-gradient-to-r from-primary to-primary/90",
            "text-primary-foreground shadow-[0_2px_10px_rgba(var(--primary-rgb),0.5)]"
          )}>
            <Wand2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-medium flex items-center gap-1">
              {title}
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </h2>
            <div className="flex items-center text-xs text-gray-300">
              {projectId ? (
                <span>Project: {projectId}</span>
              ) : (
                <span>Financial Analysis</span>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => {
              setShowHelpPanel(!showHelpPanel);
              if (onHelp) onHelp();
            }}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              "hover:bg-white/10 text-gray-300 hover:text-white"
            )}
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          {/* <button 
            onClick={onOpenSettings}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button 
            onClick={onToggleExpand}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button> */}
        </div>
      </div>
      
      {/* Help panel */}
      {showHelpPanel && (
        <div className={cn(
          "absolute right-0 top-full mt-1 w-72 z-10 p-3",
          "bg-gradient-to-r from-background/95 to-background/90",
          "rounded-xl border-2 border-border/60",
          "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.1)_inset]",
          "backdrop-blur-sm"
        )}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Wand2 className="h-4 w-4 text-primary mr-1.5" />
              <h3 className="font-medium">How to use Maestro</h3>
            </div>
            <button 
              onClick={() => setShowHelpPanel(false)}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Close help"
            >
              <X size={16} />
            </button>
          </div>
          <div className="text-sm space-y-2">
            <p>Maestro is your intelligent AI assistant. Here's how to use it:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Ask questions about any topic</li>
              <li>Generate content and creative writing</li>
              <li>Analyze data and create visualizations</li>
              <li>Get help with research and problem-solving</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">Example: "Help me draft an email to my team about our new project"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentHeader;
