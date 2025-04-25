// Workflow-specific ToolExecution matching the Python model
export interface WorkflowToolExecution {
  status: string;
  tool_output?: Record<string, any>;
}

export interface WorkflowMessage {
  type: 'instructor' | 'executor';
  content: string;
  task?: string;
  tool_execution?: WorkflowToolExecution[];
}

export interface WorkflowData {
  _id: string;
  user_id: string;
  name: string;
  status: 'created' | 'in_progress' | 'completed';
  messages: WorkflowMessage[];
  updatedAt?: string;
  frameId?: string; // Added for compatibility with our frontend
  projectId?: string; // Added for compatibility with our frontend
}

export async function getWorkflowByFrameId(frameId: string): Promise<WorkflowData> {
  try {
    const response = await fetch(`/api/agent/workflow?frameId=${frameId}`);

    if (!response.ok) {
      throw new Error(`Failed to get workflow: ${response.statusText}`);
    }

    const data = await response.json();
    return data.workflow;
  } catch (error) {
    console.error('Error getting workflow:', error);
    throw error;
  }
}

/**
 * Fetches all workflows for a specific user
 * @param userId The ID of the user whose workflows to fetch
 * @returns Array of workflow data objects
 */
export async function getWorkflowsByUserId(userId: string): Promise<WorkflowData[]> {
  try {
    const response = await fetch(`/api/agent/workflow?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to get workflows: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Get workflows Data:', data);
    
    // Process the workflows to ensure _id is a string
    const workflows = data.workflows || [];
    return workflows.map((workflow: any) => ({
      ...workflow,
      _id: workflow._id.toString(), // Convert ObjectId to string if it's not already
      // Ensure other fields are properly formatted
      updatedAt: workflow.updatedAt || null,
      messages: workflow.messages || []
    }));
  } catch (error) {
    console.error('Error getting workflows for user:', error);
    throw error;
  }
}

// Function to delete an agent frame
export async function deleteAgentFrame(frameId: string): Promise<void> {
  try {
    const response = await fetch(`/api/agent/frame/${frameId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete agent frame: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting agent frame:', error);
    throw error;
  }
}
