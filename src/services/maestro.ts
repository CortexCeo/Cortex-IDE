import { MessageType } from '@/components/agent/Messages';

// Interface for Maestro API request
interface MaestroRequest {
  workflow_id?: string;
  workflow_name?: string;
  message: string;
  user_id: string;
}

// Interface for Maestro API response events
export interface MaestroEvent {
  event: string;
  workflow_id?: string;
  content?: string;
  type?: string;
  is_cortex_output?: boolean;
  error?: string;
  task?: string;
  status?: string;
  tool_execution?: any[];
}

// Interface for Workflow
interface Workflow {
  id: string;
  user_id: string;
  name?: string;
  messages: MessageType[];
}

/**
 * Streams responses from the Maestro API
 * @param request - The request parameters for the Maestro API
 * @returns An async generator that yields MaestroEvent objects
 */
export async function* streamMaestroResponse(request: MaestroRequest): AsyncGenerator<MaestroEvent, void, unknown> {
  try {
    // Prepare the API request
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/api/maestro/run`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Create a reader from the response body stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode the chunk and add it to our buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE messages
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep the last incomplete chunk in the buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            // Parse the JSON data from the SSE message
            const eventData = JSON.parse(line.substring(6));
            yield eventData as MaestroEvent;
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streamMaestroResponse:', error);
    yield {
      event: 'error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Sends a message to the Maestro API and returns a workflow
 * @param message - The message to send
 * @param userId - The user ID
 * @param workflowId - Optional workflow ID for continuing a conversation
 * @param workflowName - Optional name for a new workflow
 * @returns The workflow object with updated messages
 */
export async function sendMaestroMessage(
  message: string,
  userId: string,
  workflowId?: string,
  workflowName?: string
): Promise<Workflow> {
  const request: MaestroRequest = {
    message,
    user_id: userId,
    workflow_id: workflowId,
    workflow_name: workflowName
  };

  let workflow: Workflow = {
    id: workflowId || '',
    user_id: userId,
    name: workflowName,
    messages: []
  };

  // Add the user message immediately for optimistic UI update
  workflow.messages.push({
    type: 'user',
    content: message,
    timestamp: new Date()
  });

  try {
    // Process all events from the stream
    for await (const event of streamMaestroResponse(request)) {
      if (event.event === 'workflow_created' && event.workflow_id) {
        workflow.id = event.workflow_id;
      } else if (event.event === 'message' && event.content && event.type) {
        // Add new message from the API
        workflow.messages.push({
          type: event.type as any,
          content: event.content,
          timestamp: new Date()
        });
      } else if (event.event === 'complete' && event.content && event.is_cortex_output) {
        // Add final Cortex response
        workflow.messages.push({
          type: 'cortex',
          content: event.content,
          timestamp: new Date()
        });
      } else if (event.event === 'error') {
        throw new Error(event.error || 'Unknown error from Maestro API');
      }
    }

    return workflow;
  } catch (error) {
    console.error('Error in sendMaestroMessage:', error);
    throw error;
  }
}

/**
 * Gets a workflow by ID
 * @param workflowId - The workflow ID
 * @returns The workflow object
 */
export async function getWorkflow(workflowId: string): Promise<Workflow> {
  try {
    const response = await fetch(`/api/maestro/workflow/${workflowId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get workflow: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting workflow:', error);
    throw error;
  }
}
