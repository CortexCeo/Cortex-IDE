import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from "@/utils/mongodb";

// Define the Section interface based on the Python class
// interface Section {
//   title: string;
//   description: string;
//   status: string;
//   content?: string;
//   web_search: boolean;
//   internal_search: boolean;
// }

// // Define the status type for DeepResearch
// type ResearchStatus = 'to_be_started' | 'in_planning' | 'in_progress' | 'completed';

// // Define the DeepResearch interface based on the Python model
// interface DeepResearch {
//   _id?: ObjectId;
//   id?: string; // External ID if different from MongoDB _id
//   user_id: string;
//   project_id: string;
//   topic: string;
//   description: string;
//   plan: Section[];
//   sources: string[];
//   status: ResearchStatus;
//   report: string;
//   created_at?: Date;
//   updated_at?: Date;
// }

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  try {
    // Await the client promise to get the MongoDB client
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE_NAME as string);
    const collection = db.collection('deep_research');

    // Get research ID from query parameters
    const { id, userId, projectId } = req.query;

    switch (req.method) {
      case 'GET':
        // If ID is provided, fetch specific research object
        if (id) {
          try {
            // Try to find by MongoDB ObjectId first
            let research;
            
            try {
              research = await collection.findOne({ 
                _id: new ObjectId(id as string) 
              });
            } catch (objIdError) {
              // If ObjectId conversion fails, try to find by string ID field
              research = await collection.findOne({ 
                id: id as string 
              });
            }
            
            if (!research) {
              console.log(`Research not found for ID: ${id}`);
              return res.status(404).json({ error: 'Research not found' });
            }
            
            return res.status(200).json(research);
          } catch (error) {
            console.error('Error fetching research by ID:', error);
            return res.status(400).json({ error: 'Invalid research ID format' });
          }
        } 
        
        // If userId and projectId are provided, fetch all research objects for that user and project
        else if (userId && projectId) {
          const researchList = await collection.find({ 
            user_id: userId as string,
            project_id: projectId as string
          }).sort({ created_at: -1 }).toArray();
          
          return res.status(200).json(researchList);
        }
        
        // If only userId is provided, fetch all research objects for that user
        else if (userId) {
          const researchList = await collection.find({ 
            user_id: userId as string
          }).sort({ created_at: -1 }).toArray();
          
          return res.status(200).json(researchList);
        } 
        
        // Otherwise fetch all research objects
        else {
          const deepResearch = await collection.find({}).toArray();
          return res.status(200).json(deepResearch);
        }
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Unable to connect to database' });
  }
}