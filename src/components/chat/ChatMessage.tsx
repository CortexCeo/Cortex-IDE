// src/components/chat/ChatMessage.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import ReasoningStep from './ReasoningStep';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from "@/components/ui/card";

export interface ChatMessageProps {
    message: any | CortexResponse;
    sender: string;
}

interface UserMessageProps {
    message: string;
}

// Interface for the ReasoningStep component
export interface ReasoningMessageProps {
    subquery: string;
    response: string;
}


interface CortexResponse {
    reasoning: ReasoningMessageProps[];
    content: string;
    table: [];
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
    return (
        <div className="flex justify-end w-full">
            <div className="bg-black dark:bg-black rounded-2xl px-4 py-2 my-2 text-white dark:text-white max-w-[80%] break-words border border-gray-200 dark:border-gray-700">
                <div className="prose prose-sm max-w-none prose-invert">
                    {message}
                </div>
            </div>
        </div>
    );
}
interface CortexResponseProps {
    message: CortexResponse;
}

function cleanMessage(message: string): string {
    return message.replace(/```text|```/g, '');
}

export function FinalAnswer({ message }: { message: any }) {
    const cleanedMessage = cleanMessage(message);
    console.log("Final Answer:", cleanedMessage);
    
    // Check if message is long enough to warrant card styling
    const wordCount = cleanedMessage.split(/\s+/).filter(word => word.length > 0).length;
    const isLongMessage = wordCount > 40; // About 3-4 lines
    
    if (isLongMessage) {
        return (
            <div className="bg-white dark:bg-gray-900 mb-2 rounded-2xl px-5 py-4 text-gray-800 dark:text-gray-100 break-words border border-gray-200 dark:border-gray-700">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {cleanedMessage}
                    </ReactMarkdown>
                </div>
            </div>
        );
    } else {
        return (
            <div className="prose prose-sm max-w-none dark:prose-invert text-gray-800 dark:text-gray-100 py-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanedMessage}
                </ReactMarkdown>
            </div>
        );
    }
}


const CortexResponse: React.FC<CortexResponseProps> = ({ message }) => {
    console.log("Rendering Cortex Response:", message);

    // Map the reasoning data to match the expected format
    const mappedReasoning = message.reasoning?.map(item => ({
        subquery: item.subquery || '',
        response: item.response || ''
    }));

    return (
        <div className="flex w-full">
            <div className="max-w-[80%] flex flex-col gap-4 my-2">
                {mappedReasoning && mappedReasoning.length > 0 && (
                    <div className="mb-2">
                        <ReasoningStep messages={mappedReasoning} />
                    </div>
                )}
                <FinalAnswer message={message.content} />
            </div>
        </div>
    );
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender }) => {
    if (sender === 'user') {
        // If sender is 'user', message must be string
        console.log("User message:", message);
        return <UserMessage message={message.content as string} />;
    }

    // If message is an object with a reasoning array and final_answer string
    if (typeof message === 'object' && message !== null && sender === 'cortex') {
        console.log("Cortex Response:", message);
        return <CortexResponse message={message} />;
    }

    // Fallback for an unexpected scenario
    return (
        <div className="flex w-full justify-center my-2">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 rounded-md border border-red-200 dark:border-red-700 text-sm">
                Invalid message format
            </div>
        </div>
    );
};

export default ChatMessage;