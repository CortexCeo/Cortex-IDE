import React, { useState } from 'react';
import styles from './styles/ChatInterface.module.css';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Send, Sparkles } from "lucide-react"

interface ChatInputProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  isStreaming: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  isStreaming
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="p-5 mb-[4vh] mt-auto backdrop-blur-sm">
      <div 
        className={cn(
          "max-w-3xl mx-auto rounded-2xl p-2",
          "bg-gradient-to-r from-background/95 to-background/90",
          "border-2 border-border/60 transition-all duration-300",
          "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.1)_inset]",
          isFocused && "border-primary/30 shadow-md shadow-primary/5"
        )}
      >
        <div className="relative flex items-center">
          <Input
            placeholder="Ask cortex..."
            className={cn(
              "border-0 shadow-none py-6 text-base bg-transparent",
              "transition-all duration-300 pr-24"
            )}
            value={inputValue}
            onChange={onInputChange}
            disabled={isStreaming}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
                e.preventDefault();
                onSendMessage();
              }
            }}
          />
          <div className="absolute right-2 flex items-center gap-2">
            <Button
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full",
                "bg-gradient-to-r from-primary to-primary/90",
                "text-primary-foreground", 
                "shadow-[0_2px_10px_rgba(var(--primary-rgb),0.5)]",
                "transition-all duration-300", 
                "hover:shadow-[0_4px_20px_rgba(var(--primary-rgb),0.7)] hover:scale-105",
                (!inputValue.trim() || isStreaming) && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
              disabled={!inputValue.trim() || isStreaming}
              onClick={onSendMessage}
            >
              <Send className={cn(
                "h-4 w-4",
                "transition-transform duration-300",
                inputValue.trim() && !isStreaming && "group-hover:translate-x-1"
              )} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
