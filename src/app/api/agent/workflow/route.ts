import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const frameId = searchParams.get('frameId');
    const userId = searchParams.get('userId');

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE_NAME as string);

    // If frameId is provided, get a single workflow
    if (frameId) {
      // Try to convert frameId to ObjectId if it's in the correct format
      let query;
      try {
        // If frameId is a valid ObjectId format, use it as ObjectId
        query = { _id: new ObjectId(frameId) };
      } catch (e) {
        // If frameId is not a valid ObjectId format, use it as a string
        query = { frameId };
      }

      // Query the workflows collection for the given frameId
      const workflow = await db.collection('workflows').findOne(query);

      if (!workflow) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ workflow });
    } 
    // If userId is provided, get all workflows for that user
    else if (userId) {
      // Query the workflows collection for the given userId
      const workflows = await db.collection('workflows')
        .find({ user_id: userId })
        .sort({ updated_at: -1 }) // Sort by most recently updated
        .toArray();

      return NextResponse.json({ workflows });
    } 
    // Neither frameId nor userId provided
    else {
      return NextResponse.json(
        { error: 'Either frameId or userId is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching workflow(s):', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow data' },
      { status: 500 }
    );
  }
}
