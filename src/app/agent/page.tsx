'use client';

import React, { useState } from 'react';
import AgentFrame from '@/components/agent/frame';

export default function AgentPage() {
  const [projectId] = useState('demo-project-123');
  
  const handleFrameCreated = (frameId: string, projectId: string) => {
    console.log(`Frame created with ID: ${frameId} for project: ${projectId}`);
    // In a real implementation, you might want to save this to state or localStorage
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Agent Interface</h1>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto">
          <AgentFrame 
            projectId={projectId}
            onFrameCreated={handleFrameCreated}
          />
        </div>
      </div>
    </div>
  );
}
