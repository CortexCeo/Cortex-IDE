import axios from 'axios';

/**
 * Interface for the deep research request payload
 */
export interface DeepResearchRequest {
  conversation_id?: string;
  message?: string;
  feedback?: boolean | string;
}

/**
 * Interface for the plan response type
 */
export interface PlanResponse {
  report_id: string;
  plan: any;
  type: 'plan';
  description: string;
  topic: string;
}

/**
 * Interface for the cortex response type
 */
export interface CortexResponse {
  reply: any;
  type: 'cortex';
  conversation_id: string;
}

/**
 * Union type for the deep research response
 */
export type DeepResearchResponse = PlanResponse | CortexResponse;

/**
 * Sends a POST request to the deepdive endpoint to create a new deep research report
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param request - The research request containing message and optional conversation_id and feedback
 * @returns Promise with the response data which can be either a PlanResponse or CortexResponse
 */
export async function createDeepResearch(
  userId: string,
  projectId: string,
  request: DeepResearchRequest
): Promise<DeepResearchResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/api/deepdive/${userId}/${projectId}`;
    
    // Explicitly set method to POST and provide the full configuration
    const response = await axios({
      method: 'POST',
      url: url,
      data: request,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating deep research:', error);
    throw error;
  }
}
  
export async function continueDeepResearch(
  userId: string,
  projectId: string,
  reportId: string,
  request: DeepResearchRequest
): Promise<PlanResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/api/deepdive/${userId}/${projectId}/${reportId}/continue`;
    
    // Explicitly set method to POST and provide the full configuration
    const response = await axios({
      method: 'POST',
      url: url,
      data: request,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating deep research:', error);
    throw error;
  }
}
  