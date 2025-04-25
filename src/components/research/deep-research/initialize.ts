import { getDeepResearchByUser } from './functions';
import { SectionSources } from './DeepResearchPage';

/**
 * Research item structure representing a deep research document
 * This combines all fields from both frontend and backend representations
 */

// Define the Section interface
interface Section {
    title: string;
    description: string;
    status: string;
    content?: string;
    web_search: boolean;
    internal_search: boolean;
  }
  
// Define the status type for DeepResearch
type ResearchStatus = 'to_be_started' | 'in_planning' | 'in_progress' | 'completed';

export interface ResearchItem {
  _id?: string;
  id?: string;
  user_id: string;
  project_id: string;
  topic: string;
  description: string;  // Required to match DeepResearch
  plan?: Section[];     // Added from DeepResearch
  status: ResearchStatus; // Using the proper enum type
  created_at?: string;
  updated_at?: string;
  report?: string;
  sources?: SectionSources[];
  insights?: string[];
  type?: string;       // Type of research (e.g., 'Market Analysis', 'Competitor Research')
}

/**
 * Project data structure with ID, name, count of research items, and the research items themselves
 */
export interface ProjectData {
  id: string;
  name: string;
  count: number;
  expanded?: boolean;
  items?: ResearchItem[];
}

/**
 * Fetches research data for a user and groups it by project
 * @param userId The user ID to fetch research data for
 * @returns Promise containing an array of project data objects
 */
export async function initializeProjects(userId: string): Promise<ProjectData[]> {
  try {
    // Fetch research data for the user
    const researchData = await getDeepResearchByUser(userId);
    
    // Group research by project_id and count them
    const projectMap = new Map<string, { name: string, count: number, items: ResearchItem[] }>();
    
    // Process each research item
    researchData.forEach((research: { project_id?: string }) => {
      if (research.project_id) {
        // If this project already exists in our map, increment its count
        if (projectMap.has(research.project_id)) {
          const projectData = projectMap.get(research.project_id);
          if (projectData) {
            projectData.count += 1;
            projectData.items.push(research as ResearchItem);
          }
        } else {
          // Otherwise create a new entry with count 1
          // Use the project_id as the name for now (could be replaced with real project names in the future)
          projectMap.set(research.project_id, { 
            name: `Project ${research.project_id.substring(0, 8)}`, 
            count: 1,
            items: [research as ResearchItem]
          });
        }
      }
    });
    
    // Convert the map to an array of project objects
    const projectsArray = Array.from(projectMap.entries()).map(([id, data]) => ({
      "id" : id,
      "name" : data.name,
      "count" : data.count,
      "expanded": false,
      "items": data.items
    }));
    
    return projectsArray;
  } catch (error) {
    console.error("Error fetching research data:", error);
    return [];
  }
}
