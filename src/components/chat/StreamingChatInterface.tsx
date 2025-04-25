import React, { useState, useEffect, useRef } from 'react';
import { ChatStreamingService, streamChatMessage } from '@/services/chatService';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { USER_ID } from '@/config/user';

interface Conversation {
    _id: string;
    messages: Array<{
        content: string;
        sender: 'user' | 'cortex' | 'error';
        reasoning?: Array<{ subquery: string; response: string }>;
        table?: any[];
    }>;
}

interface StreamingChatInterfaceProps {
    conversation?: Conversation;
    projectId: string;
    onConversationCreated?: (conversationId: string, projectId: string) => void;
}

const StreamingChatInterface: React.FC<StreamingChatInterfaceProps> = ({
    conversation,
    projectId,
    onConversationCreated,
}) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const disconnectRef = useRef<(() => void) | null>(null);
    const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const INACTIVITY_TIMEOUT = 1000 * 60 * 5; // 5 minutes
    const wsServiceRef = useRef<ChatStreamingService | null>(null);

    const resetInactivityTimeout = () => {
        if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
        }

        inactivityTimeoutRef.current = setTimeout(() => {
            if (disconnectRef.current && connectionStatus === 'connected') {
                disconnectRef.current();
                setConnectionStatus('disconnected');
            }
        }, INACTIVITY_TIMEOUT);
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

    // Initialize with conversation data if provided
    useEffect(() => {
        const initialMessages = conversation?.messages ?? [];
        const initialConversationId = conversation?._id ?? null;
        console.log('API_BASE_URL_DOC_SERVICE:', process.env.API_BASE_URL_DOC_SERVICE);
        setMessages(initialMessages);
        setConversationId(initialConversationId);
    }, [conversation]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize WebSocket connection
    useEffect(() => {

        // Create new connection
        wsServiceRef.current = new ChatStreamingService(USER_ID, projectId, conversationId)
            .connect()
            .onStream((data) => {
                // Reset inactivity timeout on each stream chunk
                resetInactivityTimeout();
                console.log('Stream data received:', data);

                // Update the response based on stream data
                setMessages(prev => {
                    const updated = [...prev];
                    const tempResponseIndex = updated.length - 1;
                    
                    // Check for type of message in the SSE response
                    if (data.type === 'connected') {
                        // Handle connection notification
                        console.log('Connected to chat stream with conversation ID:', data.conversation_id);
                        if (data.conversation_id && !conversationId) {
                            setConversationId(data.conversation_id);
                            // Notify parent component that a new conversation was created
                            if (onConversationCreated) {
                                onConversationCreated(data.conversation_id, projectId);
                            }
                        }
                        return updated;
                    }
                    else if (data.type === 'stream') {
                        // For streaming content - append to current response
                        if (updated[tempResponseIndex]) {
                            updated[tempResponseIndex].content = 
                                (updated[tempResponseIndex].content || '') + (data.data || '');
                        }
                    }
                    // Keep backward compatibility with legacy message types
                    else if (['query', 'response', 'response-streaming', 'final-answer-streaming', 'complete'].includes(data.type)) {
                        const reasoning = [...(updated[tempResponseIndex]?.reasoning || [])];
                        
                        if (data.type === 'query') {
                            // Check if there's an incomplete reasoning entry
                            const lastReasoning = reasoning[reasoning.length - 1];
                            if (lastReasoning && !lastReasoning.response) {
                                // Update existing incomplete subquery
                                lastReasoning.subquery = data.content || '';
                            } else {
                                // Create new entry only if last one is complete
                                reasoning.push({
                                    subquery: data.content || '',
                                    response: ''
                                });
                            }
                            updated[tempResponseIndex].reasoning = reasoning;
                        }
                        else if (data.type === 'response') {
                            if (reasoning.length > 0) {
                                reasoning[reasoning.length - 1].response = data.content || '';
                                updated[tempResponseIndex].reasoning = reasoning;
                            }
                        }
                        else if (data.type === 'response-streaming') {
                            reasoning[reasoning.length - 1].response = reasoning[reasoning.length - 1].response + data.content || '';
                            updated[tempResponseIndex].reasoning = reasoning;
                        }
                        else if (data.type === 'final-answer-streaming') {
                            updated[tempResponseIndex].content += data.content || '';
                        }
                        else if (data.type === 'complete') {
                            updated[tempResponseIndex].content = data.content || '';
                            if (data.table) updated[tempResponseIndex].table = data.table || [];
                        }
                    }

                    return updated;
                });
            })
            .onFinished(() => {
                setIsStreaming(false);
                console.log('Stream finished, conversation ID:', conversationId);
                // Reset inactivity timeout after message completion
                resetInactivityTimeout();
            })
            .onError((error) => {
                console.error('Streaming error:', error);
                setIsStreaming(false);
                setErrorMessage(error);

                // Update the last message to show the error
                setMessages(prev => {
                    const updated = [...prev];
                    const tempResponseIndex = updated.length - 1;
                    updated[tempResponseIndex] = {
                        content: `Error: ${error}`,
                        sender: 'error'
                    };
                    return updated;
                });
            })
            .onStatusChange((status) => {
                setConnectionStatus(status);
                if (status === 'connected') {
                    resetInactivityTimeout();
                }
                console.log('SSE connection status:', status);
            });

        // Store disconnect function for cleanup
        disconnectRef.current = () => wsServiceRef.current?.disconnect();
        
        // Cleanup function that runs when the component unmounts or when conversationId changes
        return () => {
            console.log('StreamingChatInterface cleanup: disconnecting SSE connection');
            if (wsServiceRef.current) {
                wsServiceRef.current.disconnect();
                wsServiceRef.current = null;
            }
            
            if (inactivityTimeoutRef.current) {
                clearTimeout(inactivityTimeoutRef.current);
                inactivityTimeoutRef.current = null;
            }
        };
    }, [conversationId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (query: string) => {
        // Don't send empty messages
        if (!query.trim()) return;

        // Reset error message
        setErrorMessage(null);

        // Reset inactivity timeout
        resetInactivityTimeout();

        // Add user message to UI
        const userMessage = {
            content: query,
            sender: 'user'
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsStreaming(true);

        // Create temporary response object
        setMessages(prev => [
            ...prev,
            {
                sender: 'cortex',
                content: '',
                reasoning: []
            }
        ]);

        // If WebSocket is not connected, wait for reconnection
        if (!wsServiceRef.current) {
            // Create new connection and wait for it to connect
            wsServiceRef.current = new ChatStreamingService(USER_ID, projectId, conversationId)
                .connect();

            // With SSE we don't need to wait for connection
            // The connection happens when sendMessage is called
            setConnectionStatus('connecting');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        try {
            // Send the message using existing connection
            wsServiceRef.current?.sendMessage(query);
        } catch (error) {
            console.error('Failed to send message:', error);
            setIsStreaming(false);
            setErrorMessage(error instanceof Error ? error.message : 'Unknown error');

            // Add error message
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    sender: 'error'
                };
                return updated;
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'bg-green-500';
            case 'connecting':
                return 'bg-yellow-500';
            case 'disconnected':
                return 'bg-gray-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="flex flex-col h-full w-[95%] mx-auto">
            <div className="flex justify-end p-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getConnectionStatusColor()} text-white`}>
                    {connectionStatus === 'connected' && 'Streaming Connected'}
                    {connectionStatus === 'connecting' && 'Establishing Stream...'}
                    {connectionStatus === 'disconnected' && 'Stream Disconnected'}
                    {connectionStatus === 'error' && 'Stream Error'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100/90 [&::-webkit-scrollbar-thumb]:dark:bg-gray-500/90 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-none">
                <div className="w-[85%] mx-auto">
                {messages.map((message, index) => (
                    <ChatMessage
                        key={index}
                        message={message}
                        sender={message.sender}
                    />
                ))}
                {isStreaming && (
                    <div className="flex justify-center items-center py-2">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse delay-150"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse delay-300"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
                </div>
            </div>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
                    {errorMessage}
                </div>
            )}

            <div className="p-3">
                <ChatInput
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    onSendMessage={() => handleSendMessage(inputValue)}
                    isStreaming={isStreaming}
                />
            </div>
        </div>
    );
};

export default StreamingChatInterface; 