import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContextProps {
    text: string;
}

const Context: React.FC<ContextProps> = ({ text }) => {
    return (
        <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-400 prose prose-xs max-w-none dark:prose-invert text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || ''}</ReactMarkdown>
        </div>
    );
};

function cleanText(text: string): string {
    // Remove starting asterisks and spaces
    text = text.replace(/^\s*\*\s*/gm, '');
    // Normalize line breaks
    text = text.replace(/(\r\n|\r|\n)+/g, '\n').trim();
    console.log(text);
    return text;
}

export interface ReasoningMessageProps {
    subquery: string;
    response: string;
    shouldShow: boolean;
}

const ToggleStep: React.FC<ReasoningMessageProps> = ({ subquery, response, shouldShow }) => {
    const [isOpen, setIsOpen] = useState(shouldShow);

    return (
        <div className="mb-2">
            <div 
                className="flex items-center gap-2 py-1 px-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-4 h-4 flex items-center justify-center">
                    <svg 
                        className={`w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{subquery}</div>
            </div>
            {isOpen && (
                <div className="pl-6 pr-2 py-1">
                    <Context text={cleanText(response)} />
                </div>
            )}
        </div>
    );
};

interface ReasoningStepListProps {
    messages: any;
}

const ReasoningStep: React.FC<ReasoningStepListProps> = ({ messages }) => {
    return (
        <div className="w-[90%]">
            {/* Header */}
            <div className="flex flex-col justify-between items-start mb-1 px-1">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reasoning steps</h2>                
            </div>

            <div className="border-l border-gray-200 dark:border-gray-700 pl-2 ml-1">
                {messages.map((msg: any, index: number) => (
                    <ToggleStep key={index} {...msg} shouldShow={index === messages.length} />
                ))}
            </div>
            {/* <span className="text-xs text-gray-500 dark:text-gray-400">{messages.length} steps</span> */}
        </div>
    );
};

export default ReasoningStep;