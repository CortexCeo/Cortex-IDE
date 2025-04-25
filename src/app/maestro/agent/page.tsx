'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AgentFrame from '@/components/agent/frame';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function MaestroAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState<string>('');
  const [frameId, setFrameId] = useState<string | null>(null);
  
  useEffect(() => {
    // Get projectId and frameId from URL query parameters
    const projectIdParam = searchParams.get('projectId');
    const frameIdParam = searchParams.get('frameId');
    
    if (projectIdParam) {
      setProjectId(projectIdParam);
    } else {
      // If no projectId is provided, use a default one for demo purposes
      setProjectId('demo-project-123');
    }
    
    // Set frameId if available in URL
    if (frameIdParam) {
      setFrameId(frameIdParam);
    }
  }, [searchParams]);

  const handleFrameCreated = (newFrameId: string, projectId: string) => {
    console.log(`Frame created with ID: ${newFrameId} for project: ${projectId}`);
    setFrameId(newFrameId);
    
    // In a real implementation, you might want to update the URL with the frameId
    // router.push(`/maestro/agent?projectId=${projectId}&frameId=${newFrameId}`);
  };

  const handleCreateNewFrame = () => {
    // Reset the frameId to create a new frame
    setFrameId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Main content - full screen */}
      <div className="flex-1 overflow-hidden">
        {projectId && (
          <AgentFrame 
            projectId={projectId}
            frameId={frameId || undefined}
            onFrameCreated={handleFrameCreated}
          />
        )}
      </div>
    </div>
  );
}
