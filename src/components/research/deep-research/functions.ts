import axios from 'axios';
import { ResearchItem } from './initialize';

/**
 * Fetches a deep research report by its ID
 * @param id The MongoDB ID of the research report to fetch
 * @returns Promise containing the research report data or null if not found
 */
export async function getDeepResearchById(id: string): Promise<ResearchItem | null> {
  try {
    // Make API call to the deepResearch endpoint with the ID parameter
    const response = await axios.get(`/api/deepResearch?id=${id}`);
    
    // If successful, return the data
    if (response.status === 200) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    // Handle errors (404 not found, invalid ID format, etc.)
    console.error('Error fetching deep research:', error);
    return null;
  }
}

/**
 * Deletes a deep research report by its ID
 * @param id The MongoDB ID of the research report to delete
 * @returns Promise containing a boolean indicating success or failure
 */
export async function deleteDeepResearchById(id: string): Promise<boolean> {
  try {
    // Make API call to the deepResearch endpoint with the ID parameter using DELETE method
    const response = await axios.delete(`/api/deepResearch?id=${id}`);
    
    // If successful, return true
    if (response.status === 200) {
      return true;
    }
    
    return false;
  } catch (error) {
    // Handle errors (404 not found, invalid ID format, etc.)
    console.error('Error deleting deep research:', error);
    return false;
  }
}

/**
 * Fetches all deep research reports for a specific user
 * @param userId The user ID to fetch research reports for
 * @param projectId Optional project ID to filter by
 * @returns Promise containing an array of research reports
 */
export async function getDeepResearchByUser(
  userId: string, 
  projectId?: string
): Promise<ResearchItem[]> {
  try {
    // Build the query URL based on whether projectId is provided
    const queryUrl = projectId 
      ? `/api/deepResearch?userId=${userId}&projectId=${projectId}`
      : `/api/deepResearch?userId=${userId}`;
    
    // Make API call to the deepResearch endpoint
    const response = await axios.get(queryUrl);
    
    // If successful, return the data array
    if (response.status === 200) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching deep research list:', error);
    return [];
  }
}

export async function getDeepResearchTypes(userId: string): Promise<string[]> {
  try {
    const response = await axios.get(`/api/deepResearch?getTypes=true&userId=${userId}`);
    if (response.status === 200) {
      return response.data.types;
    }
    return [];
  } catch (error) {
    console.error('Error fetching deep research types:', error);
    return [];
  }
}