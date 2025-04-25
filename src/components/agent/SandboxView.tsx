import React from 'react';
import { FileText, X, FileDown } from 'lucide-react';
import { ExcelContent } from '@/components/content/ExcelContent';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TypeScript interface based on the Pydantic model
export interface TickerArtifact {
  output?: string;
  ticker_symbol?: string;
  fyear?: string;
  output_type?: string;
  file_type?: string;
  attached_csv?: any;
  artifact_name?: string;
}

// Sandbox component for displaying CSV and other file types
export interface SandboxProps {
  toolOutput: TickerArtifact;
  fileType: string;
  onClose: () => void;
}

export const SandboxView: React.FC<SandboxProps> = ({ toolOutput, fileType, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden rounded-xl shadow-sm m-2">
      {/* Tech-inspired decorative element */}
      {/* <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div> */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 backdrop-blur-sm">
        {/* <div className="absolute left-0 top-0 h-8 w-1 bg-blue-500 opacity-50 rounded-tr-md rounded-br-md"></div> */}
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {toolOutput.artifact_name ? toolOutput.artifact_name : 'Data'} 
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 ml-1">.{fileType}</span>
          </h3>
        </div>
        <button 
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {fileType === 'csv' ? (
            <div className="h-full">
              {toolOutput.attached_csv && Array.isArray(toolOutput.attached_csv) ? (
                <div className="p-2">
                  <ExcelContent 
                    data={toolOutput.attached_csv} 
                  />
                </div>
              ) : (
                <div className="p-4">
                  <p className="mb-2 text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                    <span className="italic">CSV Viewer</span>
                  </p>
                  <div className="p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center bg-gray-50 dark:bg-gray-800/40 backdrop-filter backdrop-blur-sm">
                    <p className="text-sm">No valid CSV data found.</p>
                  </div>
                </div>
              )}
            </div>
          ) : fileType === 'md' ? (
            <div className="h-full p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Markdown Document</span>
                </div>
                <button className="text-xs flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                  <FileDown className="h-3 w-3 mr-1" />
                  Download
                </button>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                <div className="p-6 space-y-6 prose prose-sm max-w-none dark:prose-invert overflow-auto">
                  {toolOutput.output ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {toolOutput.output}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center italic">No content available</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <p className="mb-2 text-gray-500 dark:text-gray-400 flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                <span className="font-mono text-xs tracking-wide">{fileType.toUpperCase()} SANDBOX</span>
              </p>
              <div className="p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center bg-gray-50 dark:bg-gray-800/40 backdrop-filter backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
                    <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm">Content will be displayed here in future implementations.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
