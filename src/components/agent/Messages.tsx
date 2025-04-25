import React, { useState } from 'react';
import { User, Terminal, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import { TickerArtifact, SandboxView } from './SandboxView';
import { FinalAnswer } from '../chat/ChatMessage';

// TypeScript interfaces for tool execution

export interface WritingToolOutput {
  title?: string;
  content?: string;
}

export interface ToolExecution {
  status?: string;
  type?: string;
  tool_output?: TickerArtifact | WritingToolOutput;
}

export interface BaseMessage {
  id?: string;
  content: string;
  timestamp?: Date;
}

// User Message
export interface UserMessage extends BaseMessage {
  type: 'user';
}

//Cortex Response
export interface CortexMessage extends BaseMessage {
  type: 'cortex';
  content: string;
}

// Agent Message with subtypes
export interface InstructorMessage extends BaseMessage {
  type: 'instructor';
}

export interface ExecutorMessage extends BaseMessage {
  type: 'executor';
  task?: string;
  tool_execution?: ToolExecution[];
}

// Status Message
export interface StatusMessage extends BaseMessage {
  type: 'status';
}

// Union type for all message types
export type MessageType = UserMessage | InstructorMessage | ExecutorMessage | CortexMessage | StatusMessage;

// Base Message Component
interface MessageProps {
  message: MessageType;
  isSandboxActive?: boolean;
}

// User Message Component
export const UserMessageComponent: React.FC<{ message: UserMessage }> = ({ message }) => {
  return (
    <div className="flex justify-end my-2">
      <div className="bg-black text-white mb-2 rounded-2xl px-3 py-1 max-w-[85%] break-words border border-gray-800">
        <div className="prose prose-sm max-w-none prose-invert">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export const CortexMessageComponent: React.FC<{ message: CortexMessage }> = ({ message }) => {
  return (
    <>
     <FinalAnswer message={message.content} />
    </>
  );
};

// Instructor Message Component
export const InstructorMessageComponent: React.FC<{ message: InstructorMessage }> = ({ message }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-3 rounded-2xl max-w-[85%] border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-2">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-full p-1 mr-2">
            <Terminal className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Maestro</div>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

// SandboxView component has been moved to its own file: SandboxView.tsx

// Executor Message Component
export interface ExecutorMessageComponentProps {
  message: ExecutorMessage;
  isSandboxActive?: boolean;
  onSandboxToggle?: (toolOutput: TickerArtifact | WritingToolOutput, fileType: string) => void;
  messageId?: string;
}

export const ExecutorMessageComponent: React.FC<ExecutorMessageComponentProps> = ({ 
  message, 
  isSandboxActive,
  onSandboxToggle,
  messageId 
}) => {
  const [sandboxData, setSandboxData] = useState<{toolOutput: TickerArtifact; fileType: string} | null>(null);
  
  // Use isSandboxActive from props if it's provided, otherwise use local state
  const isShowingSandbox = isSandboxActive !== undefined ? isSandboxActive : sandboxData !== null;
  
  const handleToggleSandbox = (toolOutput: TickerArtifact | WritingToolOutput, fileType: string = 'csv') => {
    // Handle different tool types
    if ('attached_csv' in toolOutput) {
      // For TickerArtifact with CSV data
      const safeToolOutput: TickerArtifact = {
        output: toolOutput.output || '',
        ticker_symbol: toolOutput.ticker_symbol || '',
        fyear: toolOutput.fyear || '',
        output_type: toolOutput.output_type || '',
        file_type: toolOutput.file_type || '',
        attached_csv: toolOutput.attached_csv || {},
        artifact_name: toolOutput.artifact_name || 'data'
      };
      if (sandboxData && JSON.stringify(sandboxData.toolOutput) === JSON.stringify(toolOutput)) {
        setSandboxData(null); // Close sandbox if already open
      } else {
        setSandboxData({ toolOutput: safeToolOutput, fileType });
      }
    } else if ('title' in toolOutput || 'content' in toolOutput) {
      // For WritingToolOutput with markdown content
      // We need to adapt the writing tool output to the TickerArtifact format
      // by mapping properties appropriately
      const adaptedToolOutput: TickerArtifact = {
        output: (toolOutput as WritingToolOutput).content || '',
        artifact_name: (toolOutput as WritingToolOutput).title || 'Document',
        file_type: 'md',
        attached_csv: null, // Not used for markdown
        ticker_symbol: '',
        fyear: '',
        output_type: 'markdown'
      };
      
      if (sandboxData && sandboxData.fileType === 'md' && 
          JSON.stringify(sandboxData.toolOutput.output) === JSON.stringify(adaptedToolOutput.output)) {
        setSandboxData(null); // Close sandbox if already open
      } else {
        setSandboxData({ toolOutput: adaptedToolOutput, fileType: 'md' });
      }
    }
  };
  
  const closeSandbox = () => {
    setSandboxData(null);
  };
  return (
    <div className="flex mb-4 justify-start">
      <div className="max-w-[90%] bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 p-3 rounded-2xl border border-gray-300 dark:border-gray-700 font-mono">
        <div className="flex items-center mb-2">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-full p-1 mr-2">
            <FileText className="h-3 w-3 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="text-xs font-mono text-gray-600 dark:text-gray-400">Console</div>
        </div>
        
        {/* Task first */}
        {message.task && (
          <div className="mb-3 text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-md border border-gray-200 dark:border-gray-800">
            <span className="font-semibold">$ </span>{message.task}
          </div>
        )}
        
        {/* Tool execution details */}
        {message.tool_execution && message.tool_execution.length > 0 && (
          <div className="mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
            <div className="text-xs font-mono mb-2 flex items-center">
              <span>Tool Status</span>
              <span className="ml-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-sm text-[10px] font-mono">
                {message.tool_execution.length}
              </span>
            </div>
            
            {message.tool_execution.map((execution, idx) => (
              <div key={idx} className="mb-3 bg-white dark:bg-gray-900 p-2 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-mono">
                {/* If tool_output is not available and status is a custom message, show loading animation */}
                {!execution.tool_output && typeof execution.status === 'string' && execution.status !== 'success' && execution.status !== 'error' ? (
                  <div className="mt-1.5 p-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center">
                      <div className="animate-pulse flex space-x-2 items-center">
                        <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-blue-400 rounded-full animation-delay-200"></div>
                        <div className="h-2 w-2 bg-blue-400 rounded-full animation-delay-400"></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {execution.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center mb-1">
                    {execution.status === 'success' ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    ) : execution.status === 'error' ? (
                      <XCircle className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                    ) : (
                      <Terminal className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300 mr-1.5" />
                    )}
                    
                    <div className="font-mono text-gray-700 dark:text-gray-300">
                      {execution.status ? execution.status.charAt(0).toUpperCase() + execution.status.slice(1) : 'Processing'}
                    </div>
                  </div>
                )}
                
                {execution.tool_output ? (
                  <>
                    {/* For writing_tool type */}
                    {execution.type === 'writing_tool' && (
                      <div className="mt-1.5 p-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {(execution.tool_output as WritingToolOutput).title ? (execution.tool_output as WritingToolOutput).title : 'Document'} created
                            </span>
                          </div>
                          <button 
                            className="flex items-center px-2 py-1 text-[10px] rounded-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30 border border-blue-200 dark:border-blue-800 font-mono transition-colors"
                            onClick={() => {
                              if (execution.tool_output) {
                                // Use parent's toggle function if provided, otherwise use local state
                                if (onSandboxToggle && messageId) {
                                  onSandboxToggle(execution.tool_output as WritingToolOutput, 'md');
                                } else {
                                  handleToggleSandbox(execution.tool_output as WritingToolOutput, 'md');
                                }
                              }
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* For financial_tool type (default) */}
                    {(execution.type === 'financial_tool' || !execution.type) && (
                      <div className="mt-1.5 p-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                        <div className="grid grid-cols-2 gap-1 mb-2 text-[11px] font-mono text-gray-600 dark:text-gray-400">
                          {(execution.tool_output as TickerArtifact).artifact_name && (
                            <div>
                              <span className="font-mono text-gray-700 dark:text-gray-300">Artifact:</span> {(execution.tool_output as TickerArtifact).artifact_name}
                            </div>
                          )}
                          {(execution.tool_output as TickerArtifact).ticker_symbol && (
                            <div>
                              <span className="font-mono text-gray-700 dark:text-gray-300">Ticker:</span> {(execution.tool_output as TickerArtifact).ticker_symbol}
                            </div>
                          )}
                          {(execution.tool_output as TickerArtifact).fyear && (
                            <div>
                              <span className="font-mono text-gray-700 dark:text-gray-300">Fiscal Year:</span> {(execution.tool_output as TickerArtifact).fyear}
                            </div>
                          )}
                          {(execution.tool_output as TickerArtifact).output_type && (execution.tool_output as TickerArtifact).file_type && (
                            <div>
                              <span className="font-mono text-gray-700 dark:text-gray-300">Type:</span> {(execution.tool_output as TickerArtifact).output_type} ({(execution.tool_output as TickerArtifact).file_type})
                            </div>
                          )}
                        </div>
                        
                        {(execution.tool_output as TickerArtifact).output && (
                          <div className="mt-2 p-2 bg-black rounded-md overflow-x-auto">
                            <pre className="text-xs whitespace-pre-wrap font-mono text-gray-300">{(execution.tool_output as TickerArtifact).output}</pre>
                          </div>
                        )}
                        
                        {(execution.tool_output as TickerArtifact).attached_csv && (
                          <div className="mt-2 p-1.5 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">CSV File Created:</span>
                                <span className="ml-1.5 text-xs text-gray-600 dark:text-gray-400 font-mono">
                                  {typeof (execution.tool_output as TickerArtifact).artifact_name === 'string' 
                                    ? (execution.tool_output as TickerArtifact).artifact_name + '.csv'
                                    : 'data.csv'}
                                </span>
                              </div>
                              <button 
                                className="flex items-center px-2 py-1 text-[10px] rounded-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30 border border-blue-200 dark:border-blue-800 font-mono transition-colors"
                                onClick={() => {
                                  if (execution.tool_output) {
                                    // Use parent's toggle function if provided, otherwise use local state
                                    if (onSandboxToggle && messageId) {
                                      onSandboxToggle(execution.tool_output as TickerArtifact, 'csv');
                                    } else {
                                      handleToggleSandbox(execution.tool_output as TickerArtifact, 'csv');
                                    }
                                  }
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-1.5 p-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 text-center">
                    <span className="text-xs text-gray-500">Processing tool output...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Message content last */}
        <p className="text-sm whitespace-pre-wrap mt-3">{message.content}</p>
      </div>
    </div>
  );
};

// Main Message Component that renders the appropriate type
export interface MessageComponentProps extends MessageProps {
  onSandboxToggle?: (toolOutput: TickerArtifact | WritingToolOutput, fileType: string) => void;
  messageId?: string;
}

// Status Message Component 
export const StatusMessageComponent: React.FC<{ message: StatusMessage }> = ({ message }) => {
  return (
    <div className="flex justify-start my-2">
      <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-3 transition-all duration-300 ease-in-out">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <p className="text-sm font-light">{message.content}</p>
      </div>
    </div>
  );
};

export const MessageComponent: React.FC<MessageComponentProps> = ({ message, isSandboxActive, onSandboxToggle, messageId }) => {
  switch (message.type) {
    case 'user':
      return <UserMessageComponent message={message} />;
    case 'instructor':
      return <InstructorMessageComponent message={message} />;
    case 'executor':
      return <ExecutorMessageComponent 
        message={message} 
        isSandboxActive={isSandboxActive} 
        onSandboxToggle={onSandboxToggle}
        messageId={messageId}
      />;
    case 'cortex':
      return <CortexMessageComponent message={message} />;
    case 'status':
      return <StatusMessageComponent message={message} />;
    default:
      return null;
  }
};
