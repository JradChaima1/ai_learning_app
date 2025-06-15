import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, isDatabaseConnectionError } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await db.findCoursesByUser(session.user.id);

    return NextResponse.json({ 
      success: true, 
      courses 
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    
    // Check if it's a database connection error
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ 
        error: 'Database temporarily unavailable. Please try again in a moment.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
} 