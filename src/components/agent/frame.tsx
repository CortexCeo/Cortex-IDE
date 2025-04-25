import React, { useState, useEffect, useRef } from 'react';
import { MessageComponent, MessageType, UserMessage, InstructorMessage, ExecutorMessage, CortexMessage, StatusMessage } from './Messages';
import { SandboxView, TickerArtifact } from './SandboxView';
import { WritingToolOutput } from './Messages';
import AgentHeader from './AgentHeader';
import { USER_ID } from "@/config/user"
import { Send, Loader2 } from 'lucide-react';
import { getWorkflowByFrameId, WorkflowData } from '@/services/agentService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AgentFrameProps {
  projectId: string;
  frameId?: string | null;
  initialMessages?: MessageType[];
  onFrameCreated?: (frameId: string, projectId: string) => void;
}

const AgentFrame: React.FC<AgentFrameProps> = ({
  projectId,
  frameId: initialFrameId = null,
  initialMessages = [], // Empty by default, will be populated from workflow or sample data
  onFrameCreated,
}) => {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages.length > 0 ? initialMessages : []);
  const [frameId, setFrameId] = useState<string | null>(initialFrameId);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  // Status is now handled in the messages array
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  // Track if we've initialized a conversation
  const hasInitializedRef = useRef<boolean>(!!initialFrameId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [approval, setApproval] = useState(true);
  
  // Add state for sandbox functionality
  const [activeSandboxMessage, setActiveSandboxMessage] = useState<string | null>(null);
  const [activeSandboxData, setActiveSandboxData] = useState<{toolOutput: TickerArtifact; fileType: string} | null>(null);
  
  // Function to update status as a message in the messages array
  const updateStatus = (status: string | null) => {
    // First remove any existing status messages
    setMessages(prev => prev.filter(msg => msg.type !== 'status'));
    
    // If we have a new status, add it as a message
    if (status) {
      const statusMessage: MessageType = {
        type: 'status',
        content: status,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, statusMessage]);
    }
  };
  
  // Function to extract and process tool output from a message
  const processToolOutput = (message: MessageType) => {
    if (message.type === 'executor' && message.tool_execution && message.tool_execution.length > 0) {
      const firstExecution = message.tool_execution[0];
      if (firstExecution.tool_output) {
        const toolOutput = firstExecution.tool_output;
        
        // Set the message ID for highlighting in the UI
        const messageIndex = messages.findIndex(m => m === message);
        if (messageIndex >= 0) {
          setActiveSandboxMessage(`message-${messageIndex}`);
        }
        
        // Validate and process different tool output types
        if ('attached_csv' in toolOutput && toolOutput.attached_csv !== null && typeof toolOutput.attached_csv === 'object') {
          // For financial_tool with CSV data
          console.log('Processing financial tool output with CSV data');
          const fileType = 'csv';
          setActiveSandboxData({ toolOutput: toolOutput as TickerArtifact, fileType });
          
        } else if (firstExecution.type === 'writing_tool' && 
                  (('title' in toolOutput && typeof toolOutput.title === 'string') || 
                   ('content' in toolOutput && typeof toolOutput.content === 'string'))) {
          // For writing_tool with markdown content
          console.log('Processing writing tool output with markdown');
          const fileType = 'md';
          const adaptedToolOutput: TickerArtifact = {
            output: (toolOutput as WritingToolOutput).content || '',
            artifact_name: (toolOutput as WritingToolOutput).title || 'Document',
            file_type: 'md',
            attached_csv: null,
            ticker_symbol: '',
            fyear: '',
            output_type: 'markdown'
          };
          setActiveSandboxData({ toolOutput: adaptedToolOutput, fileType });
          
        } else {
          // Log if we received tool output that can't be rendered in sandbox
          console.log('Tool output not compatible with sandbox rendering:', toolOutput);
          return;
        }
      }
    }
  };

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchWorkflowData = async () => {
    console.log('Fetching workflow data for frameId:', frameId);
      if (frameId && !workflowData && approval) {
        setIsLoading(true);
        try {
          // First try to get workflow data
          const workflow = await getWorkflowByFrameId(frameId);
          setWorkflowData(workflow);
          
          // Convert workflow messages to MessageType format
          if (workflow.messages && workflow.messages.length > 0) {
            const convertedMessages = workflow.messages.map(msg => ({
              type: msg.type,
              content: msg.content,
              task: msg.task,
              tool_execution: msg.tool_execution,
              timestamp: new Date() // Use current time as we don't have timestamp in the model
            })) as MessageType[];
            
            setMessages(convertedMessages);
          } else {
            // If no messages are available, use sample messages for development
            setMessages([]);
          }
        } catch (error) {
          console.error('Error fetching workflow data:', error);
          setErrorMessage('Failed to load workflow data');
          
          // If we can't load workflow data, use sample messages for development
          if (messages.length === 0) {
            setMessages([]);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchWorkflowData();
  }, [frameId]);

  // Scroll to bottom when messages change and update sandbox view with latest tool output
  useEffect(() => {
    scrollToBottom();
    
    // Find the latest message with a tool execution
    const messagesWithToolExecutions = messages.filter(
      message => message.type === 'executor' && 
                message.tool_execution && 
                message.tool_execution.length > 0 &&
                message.tool_execution[0].tool_output
    );
    
    if (messagesWithToolExecutions.length > 0) {
      // Process the most recent message with tool output
      processToolOutput(messagesWithToolExecutions[messagesWithToolExecutions.length - 1]);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Clear input
    setInputValue('');

    // Add user message to the messages array
    const userMessage: MessageType = {
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Import the streamMaestroResponse function dynamically to avoid circular dependencies
      const { streamMaestroResponse } = await import('@/services/maestro');
      
      // Prepare the request
      const request = {
        message: content,
        user_id: USER_ID,
        workflow_id: frameId || undefined,
        workflow_name: 'Maestro Conversation'
      };
      
      // Start streaming the response
      const stream = streamMaestroResponse(request);
      setApproval(false);
      // Process each event from the stream
      for await (const event of stream) {
        console.log('Received event:', event);
        if (event.event === 'workflow_created' && event.workflow_id) {
          // Update frameId if this is a new workflow
          const newFrameId = event.workflow_id;
          setFrameId(newFrameId);
          
          // Mark that we've initialized a conversation
          hasInitializedRef.current = true;
        } 
        else if (event.event === 'status' && event.status) {
          // Only show workflow loading messages during initialization {
            updateStatus(event.status);
        } 
        else if (event.event === 'message' && event.content) {
          // Clear the status message when a real message arrives
          updateStatus(null);
          // Create the appropriate message object based on the type
          let newMessage: MessageType;
          const messageId = `msg-${Date.now()}`;
          
          if (event.type === 'executor' && event.tool_execution) {
            // Handle executor message with tool execution
            newMessage = {
              id: messageId,
              type: 'executor',
              content: event.content,
              task: event.task || 'Executing task',
              timestamp: new Date(),
              tool_execution: event.tool_execution
            };
          } else if (event.type === 'instructor') {
            // Handle instructor message
            newMessage = {
              id: messageId,
              type: 'instructor',
              content: event.content,
              timestamp: new Date()
            };
          } else if (event.type === 'user') {
            // Handle user message
            newMessage = {
              id: messageId,
              type: 'user',
              content: event.content,
              timestamp: new Date()
            };
          } else {
            // Fallback for any other message types (default to instructor)
            console.warn('Unknown message type:', event.type);
            newMessage = {
              id: messageId,
              type: 'instructor',
              content: event.content || 'Message received',
              timestamp: new Date()
            };
          }
          
          // Add the message to the array
          setMessages(prev => [...prev, newMessage]);
        }
        else if (event.event === 'complete' && event.content && event.is_cortex_output) {
          updateStatus(null);
          // Add the final Cortex response
            // Create and add the Cortex message
            const cortexMessage: MessageType = {
              id: `cortex-${Date.now()}`,
              type: 'cortex',
              content: event.content,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, cortexMessage]);
          }
        else if (event.event === 'error') {
               updateStatus(null);
          throw new Error(event.error || 'Unknown error from Maestro API');
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');

      // Add an error message
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      // Create error message as an executor type with tool execution
      const errorMessage: MessageType = {
        type: 'executor',
        content: `Error: ${errorMsg}`,
        timestamp: new Date(),
        tool_execution: [
          {
            status: 'error',
            tool_output: { 
              output: `Error occurred: ${errorMsg}`,
              ticker_symbol: 'N/A',
              output_type: 'error',
              file_type: 'text',
              artifact_name: `Error_${Date.now()}`
            }
          }
        ]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenSettings = () => {
    // Placeholder for settings functionality
    console.log('Open settings');
  };

  const handleHelp = () => {
    // Placeholder for help functionality
    console.log('Open help');
  };
  
  // This function is no longer needed as the toggle is handled directly in the MessageComponent render

  // Focus the input field when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <AgentHeader 
        title={`${workflowData?.name || `Maestro Workflow Studio`}`}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        onOpenSettings={handleOpenSettings}
        onHelp={handleHelp}
      />

      {/* Collapsible content */}
      {isExpanded && (
        <>
          {/* Flex container for messages+input and sandbox */}
          <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 flex h-full">
            {/* Left side: Messages and input in a column */}
            <div className={`${activeSandboxData ? 'w-1/2' : 'w-full'} flex flex-col h-full`}>
              {/* Messages area - scrollable */}
              <div className="flex-1 overflow-y-auto items-center py-6 px-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-none">
                <div className="max-w-4xl mx-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading workflow data...</p>
                      </div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => {
                      const messageId = `message-${index}`;
                      const isSandboxActive = activeSandboxMessage === messageId;
                      
                      return (
                        <MessageComponent 
                          key={messageId} 
                          message={message} 
                          isSandboxActive={isSandboxActive}
                          messageId={messageId}
                          onSandboxToggle={(toolOutput, fileType) => {
                            // Handle sandbox toggle from message component
                            if (messageId === activeSandboxMessage) {
                              // Close the sandbox if already open
                              setActiveSandboxMessage(null);
                              setActiveSandboxData(null);
                            } else {
                              // Open the sandbox with the clicked message
                              setActiveSandboxMessage(messageId);
                              // Handle both TickerArtifact and WritingToolOutput types
                              if ('attached_csv' in toolOutput) {
                                // For financial_tool with CSV data
                                setActiveSandboxData({ toolOutput: toolOutput as TickerArtifact, fileType });
                              } else if ('title' in toolOutput || 'content' in toolOutput) {
                                // For writing_tool with markdown content
                                // Create an adapted format that works with the SandboxView component
                                const adaptedToolOutput: TickerArtifact = {
                                  output: (toolOutput as WritingToolOutput).content || '',
                                  artifact_name: (toolOutput as WritingToolOutput).title || 'Document',
                                  file_type: 'md',
                                  attached_csv: null,
                                  ticker_symbol: '',
                                  fyear: '',
                                  output_type: 'markdown'
                                };
                                setActiveSandboxData({ toolOutput: adaptedToolOutput, fileType });
                              }
                            }
                          }}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  )}
                  {/* Message end marker for scrolling */}
                  <div ref={messagesEndRef} />
                  
                  {/* Status message removed from here */}
                </div>
              </div>

              {/* Status messages are now part of the messages array */}
                
              {/* Input area - stays in left column */}
              <div className="p-5 mb-[1.5vh] mt-auto backdrop-blur-sm relative">
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
                      ref={inputRef}
                      placeholder="Ask Maestro something..."
                      className={cn(
                        "border-0 shadow-none py-6 text-base bg-transparent",
                        "transition-all duration-300 pr-24"
                      )}
                      value={inputValue}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                          e.preventDefault();
                          handleSendMessage(inputValue);
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
                          (!inputValue.trim() || isProcessing) && "opacity-50 cursor-not-allowed hover:scale-100"
                        )}
                        disabled={!inputValue.trim() || isProcessing}
                        onClick={() => handleSendMessage(inputValue)}
                      >
                        {isProcessing ? 
                          <Loader2 className="h-4 w-4 animate-spin" /> : 
                          <Send className={cn(
                            "h-4 w-4",
                            "transition-transform duration-300",
                            inputValue.trim() && !isProcessing && "group-hover:translate-x-1"
                          )} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sandbox area - only visible when a sandbox is active */}
            {activeSandboxData && (
              <div className="w-1/2 h-full overflow-hidden">
                <SandboxView 
                  toolOutput={activeSandboxData.toolOutput} 
                  fileType={activeSandboxData.fileType} 
                  onClose={() => {
                    setActiveSandboxMessage(null);
                    setActiveSandboxData(null);
                  }} 
                />
              </div>
            )}
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mx-4 mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
              {errorMessage}
            </div>
          )}

          {/* Input area has been moved inside the left column */}
        </>
      )}
    </div>
  );
};

export default AgentFrame;