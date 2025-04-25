import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/types';
import clientPromise from "@/utils/mongodb";

// In a real application, this would connect to a database
// For now, we'll use an in-memory store or mock data
let projects: Project[] = [];

/**
 * POST /api/project
 * Creates a new project for a user
 * 
 * Required fields in request body:
 * - userId: string
 * - name: string
 * 
 * Optional fields:
 * - description: string
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and name are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE_NAME as string);
    const collection = db.collection('projects');
    
    // Check if a project with the same name already exists for this user
    const existingProject = await collection.findOne({
      name: body.name,
      userId: body.userId
    });
    
    if (existingProject) {
      return NextResponse.json(
        { error: 'a project with this name already exists' },
        { status: 409 } // Conflict status code
      );
    }
    
    // Prepare the project data without id field
    const projectData = {
      name: body.name,
      files: [], // Start with no files
      userId: body.userId // We still need userId for querying, even if not in interface
    };
    
    // Insert the new project into the database
    const result = await collection.insertOne(projectData);
    
    // Create the response object with the MongoDB _id converted to our id field
    const newProject: Project = {
      id: result.insertedId.toString(), // Use MongoDB's _id as our id
      name: projectData.name,
      files: projectData.files,
      documents: [],
      conversations: [],
      isOpen: false // Default to closed
    };
    
    // Return the created project
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error in project API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/project
 * Retrieves all projects for a user
 * 
 * Required query parameter:
 * - userId: string
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE_NAME as string);
    const projectsCollection = db.collection('projects');
    const documentsCollection = db.collection('documents');
    const conversationsCollection = db.collection('conversation');
    
    // Query projects by userId
    const projectsData = await projectsCollection.find({ userId }).toArray();
    console.log("Projects:")
    console.log(projectsData)
    
    // Query documents by user_id
    const documentsData = await documentsCollection.find({ user_id: userId }).toArray();
    // console.log("Documents:")
    // console.log(documentsData)
    
    // Query conversations by user_id
    const conversationsData = await conversationsCollection.find({ user_id: userId }).toArray();
    // console.log("Conversations:")
    // console.log(conversationsData)
    
    // Group documents by project_id
    const documentsByProject: Record<string, any[]> = {};
    // Create a special category for documents without a project_id
    const unassignedDocuments: any[] = [];
    
    documentsData.forEach(doc => {
      const projectId = doc.project_id;
      const documentObj = {
        id: doc._id.toString(),
        name: doc.name || doc.filename || 'Untitled Document',
        documentType: doc.document_type || 'unknown',
        highlights: doc.highlights || [],
        summary: doc.description || 'No summary available',
        favorite: doc.favorite || false
      };
      
      if (projectId) {
        // Document has a project_id, add to that project's documents
        if (!documentsByProject[projectId]) {
          documentsByProject[projectId] = [];
        }
        documentsByProject[projectId].push(documentObj);
      } else {
        // Document has no project_id, add to unassigned documents
        unassignedDocuments.push(documentObj);
      }
    });
    
    // Group conversations by project_id
    const conversationsByProject: Record<string, any[]> = {};
    // Create a special category for conversations without a project_id
    const unassignedConversations: any[] = [];
    
    conversationsData.forEach(conv => {
      const projectId = conv.project_id;
      
      const conversationObj = {
        id: conv._id.toString(),
        title: conv.title != null ? conv.title : conv.messages[0].content,
        lastMessage: conv.messages?.length > 0 ? conv.messages[conv.messages.length - 1].content : '',
        timestamp: conv.updated_at || conv.created_at || new Date(),
        messageCount: conv.messages?.length || 0,
        favorite: conv.favorite || false,
        user_id: conv.user_id,
        project_id: conv.project_id,
        messages: conv.messages || []
      };
      
      if (projectId) {
        // Conversation has a project_id, add to that project's conversations
        if (!conversationsByProject[projectId]) {
          conversationsByProject[projectId] = [];
        }
        conversationsByProject[projectId].push(conversationObj);
      } else {
        // Conversation has no project_id, add to unassigned conversations
        unassignedConversations.push(conversationObj);
      }
    });
    
    // Map MongoDB documents to our simplified Project interface with documents and conversations
    const userProjects = projectsData.map(project => {
      const projectId = project._id.toString();
      return {
        id: projectId,
        name: project.name,
        files: project.files || [],
        documents: documentsByProject[project.name] || [],
        conversations: conversationsByProject[project.name] || [],
        isOpen: false // Default to closed
      };
    });
    
    // // If there are unassigned documents and at least one project exists, add them to the first project
    // // This is a temporary solution - ideally we'd have a better way to handle unassigned documents
    // if (unassignedDocuments.length > 0 && userProjects.length > 0) {
    //   userProjects[0].documents = [...userProjects[0].documents, ...unassignedDocuments];
    // } else if (unassignedDocuments.length > 0) {
    //   // If there are no projects but there are unassigned documents, create a default project
    //   userProjects.push({
    //     id: 'default',
    //     name: 'Default Project',
    //     files: [],
    //     documents: unassignedDocuments,
    //     isOpen: true
    //   });
    // }
    
    // Handle unassigned conversations similar to documents
    // if (unassignedConversations.length > 0 && userProjects.length > 0) {
    //   userProjects[0].conversations = [...(userProjects[0].conversations || []), ...unassignedConversations];
    // }
    
    return NextResponse.json(userProjects, { status: 200 });
  } catch (error) {
    console.error('Error in project API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
