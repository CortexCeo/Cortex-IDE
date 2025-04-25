import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from "@/utils/mongodb";

// // Define the Section interface based on the Python class
// interface Section {
//   title: string;
//   description: string;
//   status: string;
//   content?: string;
//   web_search: boolean;
//   internal_search: boolean;
// }

// Define the status type for DeepResearch
// type ResearchStatus = 'to_be_started' | 'in_planning' | 'in_progress' | 'completed';

// Define the DeepResearch interface based on the Python model
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

// // Type for creating a new DeepResearch document
// type DeepResearchDocument = Omit<DeepResearch, '_id'>;

// GET handler for fetching deep research objects
export async function GET(request: NextRequest) {
  try {
    // Get the URL to parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    
    // Await the client promise to get the MongoDB client
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE_NAME as string);
    const collection = db.collection('deep_research');

    // If ID is provided, fetch specific research object
    if (id) {
      try {
        // Try to convert the ID to ObjectId if it's a valid format
        const objectId = new ObjectId(id);
        const research = await collection.findOne({ _id: objectId });
        
        if (research) {
          return NextResponse.json(research);
        } else {
          return NextResponse.json({ error: 'Research not found' }, { status: 404 });
        }
      } catch (error) {
        // If ID is not a valid ObjectId format, try to find by the string id field
        const research = await collection.findOne({ id: id });
        
        if (research) {
          return NextResponse.json(research);
        } else {
          return NextResponse.json({ error: 'Research not found' }, { status: 404 });
        }
      }
    }
    
    // If userId is provided, filter by user
    if (userId) {
      const query: any = { user_id: userId };
      
      // Check if we should return distinct types
      const getTypes = searchParams.get('getTypes') === 'true';
      
      if (getTypes) {
        // Return all distinct types filtered by user ID
        const uniqueTypes = await collection.distinct('type', { user_id: userId });
        return NextResponse.json({ types: uniqueTypes });
      }
      
      // If projectId is also provided, filter by both user and project
      if (projectId) {
        query.project_id = projectId;
      }
      
      const researchList = await collection.find(query).toArray();
      return NextResponse.json(researchList);
    }
    
    // If no specific filters, return all research objects
    const allResearch = await collection.find({}).toArray();
    return NextResponse.json(allResearch);
  } catch (error) {
    console.error('Error in deepResearch API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler for removing deep research objects
export async function DELETE(request: NextRequest) {
  try {
    // Get the URL to parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Extract the ID parameter
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }
    
    // Await the client promise to get the MongoDB client
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE_NAME as string);
    const collection = db.collection('deep_research');
    
    // Try to delete by ObjectId first
    try {
      const objectId = new ObjectId(id);
      const result = await collection.deleteOne({ _id: objectId });
      
      if (result.deletedCount === 1) {
        return NextResponse.json({ success: true, message: 'Research deleted successfully' });
      }
    } catch (error) {
      // If ID is not a valid ObjectId format, try to delete by the string id field
      const result = await collection.deleteOne({ id: id });
      
      if (result.deletedCount === 1) {
        return NextResponse.json({ success: true, message: 'Research deleted successfully' });
      }
    }
    
    // If we get here, the item wasn't found
    return NextResponse.json({ error: 'Research not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in deepResearch DELETE API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// // POST handler for creating new deep research objects
// export async function POST(request: NextRequest) {
//   try {
//     // Parse the request body
//     const body = await request.json();
    
//     // Validate required fields
//     if (!body.user_id || !body.project_id || !body.topic) {
//       return NextResponse.json(
//         { error: 'Missing required fields: user_id, project_id, and topic are required' },
//         { status: 400 }
//       );
//     }
    
//     // Create a new research document
//     const newResearch: DeepResearchDocument = {
//       user_id: body.user_id,
//       project_id: body.project_id,
//       topic: body.topic,
//       description: body.description || '',
//       plan: body.plan || [],
//       sources: body.sources || [],
//       status: body.status || 'to_be_started',
//       report: body.report || '',
//       created_at: new Date(),
//       updated_at: new Date()
//     };
    
//     // Connect to MongoDB
//     const client = await clientPromise;
//     const db = client.db(process.env.MONGODB_DATABASE_NAME as string);
//     const collection = db.collection('deep_research');
    
//     // Insert the new research document
//     const result = await collection.insertOne(newResearch);
    
//     // Return the created document with its ID
//     return NextResponse.json({ 
//       ...newResearch, 
//       _id: result.insertedId 
//     }, { status: 201 });
//   } catch (error) {
//     console.error('Error in deepResearch API:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
