"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import AgentFrame from "@/components/agent/frame"
import { USER_ID, PROJECT_ID } from "@/config/user"
import Link from "next/link"
import { ArrowRightCircle, Bot, MessageSquare, Plus, Clock, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { getWorkflowsByUserId } from "@/services/agentService"
import { WorkflowData } from "@/services/agentService"

export default function MaestroRoute() {
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        setIsLoading(true);
        const workflows = await getWorkflowsByUserId(USER_ID);
        setRecentWorkflows(workflows);
        setError(null);
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError('Failed to load recent conversations');
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkflows();
  }, []);

  // Format the date for display
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today - show hours
      const hours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Maestro AI Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your intelligent financial analysis companion
          </p>
        </div>

        {/* New Conversation Card - Full Width and Prominent */}
        <div className="mb-8">
          <Link 
            href={`/maestro/agent?projectId=${PROJECT_ID}`}
            className="group block p-6 bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-500 hover:to-blue-600 rounded-xl shadow-md border border-blue-400 dark:border-blue-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-5">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-1">Start New Conversation</h2>
                  <p className="text-blue-100 text-base max-w-lg">
                    Ask questions, analyze financial data, and get real-time insights from your AI assistant
                  </p>
                </div>
              </div>
              <ArrowRightCircle className="h-10 w-10 text-white/70 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {/* Recent and Featured Conversations - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Recent Conversations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Conversations</h2>
              </div>
              {isLoading && (
                <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                  Loading...
                </div>
              )}
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              {recentWorkflows.length === 0 && !isLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  <p>No recent conversations found.</p>
                  <p className="mt-1">Start a new conversation to see it here!</p>
                </div>
              ) : (
                recentWorkflows.slice(0, 3).map((workflow) => (
                  <Link 
                    key={workflow._id} 
                    href={`/maestro/agent?frameId=${workflow._id}`}
                    className="flex items-center p-3.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {workflow.name || `Conversation ${workflow._id.toString().substring(0, 8)}`}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last updated {workflow.updatedAt ? formatDate(workflow.updatedAt) : 'recently'}
                      </p>
                    </div>
                    <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                      {workflow.messages?.length || 0} messages
                    </span>
                  </Link>
                ))
              )}
            </div>
            {recentWorkflows.length > 3 && <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-right">
              <Link href="/maestro/history" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                View all conversations →
              </Link>
            </div>}
          </div>

          {/* Saved/Featured Conversations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center mb-5">
              <Star className="h-5 w-5 text-amber-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Saved Workflows</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center p-3.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Competitor Analysis Template</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Saved workflow</p>
                </div>
                <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full">
                  Template
                </span>
              </div>
              <div className="flex items-center p-3.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Quarterly Report Generator</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Saved workflow</p>
                </div>
                <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full">
                  Template
                </span>
              </div>
              <div className="flex items-center p-3.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Investment Analysis</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Saved workflow</p>
                </div>
                <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full">
                  Template
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-right">
              <Link href="/maestro/saved" className="text-amber-600 dark:text-amber-400 text-sm font-medium hover:underline">
                View all saved workflows →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}