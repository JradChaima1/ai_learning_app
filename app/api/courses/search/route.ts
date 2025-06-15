import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ZillizService } from '@/lib/services/zilliz';
import { EmbeddingService } from '@/lib/services/embeddings';

async function generateEmbeddings(text: string): Promise<number[] | null> {
  try {
    // Try Novita AI first (if API key is available)
    if (process.env.NOVITA_API_KEY) {
      console.log('Using Novita AI embeddings...');
      const embeddingService = new EmbeddingService('novita');
      return await embeddingService.generateEmbeddings(text);
    }
    
    // Fallback to Hugging Face
    console.log('Using Hugging Face embeddings...');
    const embeddingService = new EmbeddingService('huggingface');
    return await embeddingService.generateEmbeddings(text);
  } catch (error: any) {
    console.error('Failed to generate embeddings:', error.message);
    
    // Check if it's an API key issue
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('API key missing or invalid, falling back to simple search');
      return null;
    }
    
    throw error;
  }
}

async function simpleTextSearch(query: string, userId: string) {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  if (searchTerms.length === 0) {
    return [];
  }

  const courses = await prisma.course.findMany({
    where: {
      userId: userId,
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate simple relevance scores based on keyword matches
  return courses.map(course => {
    const titleMatches = searchTerms.filter(term => 
      course.title.toLowerCase().includes(term)
    ).length;
    const descMatches = searchTerms.filter(term => 
      course.description?.toLowerCase().includes(term)
    ).length;
    const contentMatches = searchTerms.filter(term => 
      course.content?.toLowerCase().includes(term)
    ).length;
    
    const totalMatches = titleMatches * 3 + descMatches * 2 + contentMatches;
    const relevanceScore = totalMatches > 0 ? 1 / totalMatches : 999; // Lower score = more relevant
    
    return {
      ...course,
      relevanceScore,
      matchingContent: [
        course.title,
        course.description?.substring(0, 100) + '...'
      ].filter(Boolean)
    };
  }).sort((a, b) => a.relevanceScore - b.relevanceScore);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    console.log('Starting search for query:', query);

    // Try to generate embeddings for vector search
    const queryEmbedding = await generateEmbeddings(query);

    if (queryEmbedding) {
      // Vector search with embeddings
      console.log('Using vector search with embeddings...');
      try {
        // Determine embedding dimension based on provider
        const embeddingDimension = process.env.NOVITA_API_KEY ? 1024 : 384;
        const zillizService = new ZillizService(embeddingDimension);
        const searchResults = await zillizService.searchSimilarContent(queryEmbedding, 10);

        // Extract unique course IDs from search results
        const courseIds = [...new Set(searchResults.map((result: any) => result.course_id))];

        if (courseIds.length === 0) {
          return NextResponse.json({ 
            success: true, 
            courses: [],
            searchResults: [],
            message: 'No courses found matching your search',
            method: 'vector'
          });
        }

        // Fetch the actual course data from database
        const courses = await prisma.course.findMany({
          where: {
            id: { in: courseIds },
            userId: session.user.id
          },
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Map search results to courses with relevance scores
        const coursesWithRelevance = courses.map(course => {
          const courseSearchResults = searchResults.filter((result: any) => result.course_id === course.id);
          const avgScore = courseSearchResults.reduce((sum: number, result: any) => sum + (result.score || 0), 0) / courseSearchResults.length;
          
          return {
            ...course,
            relevanceScore: avgScore,
            matchingContent: courseSearchResults.map((result: any) => result.content).slice(0, 2)
          };
        });

        // Sort by relevance score
        coursesWithRelevance.sort((a, b) => a.relevanceScore - b.relevanceScore);

        return NextResponse.json({
          success: true,
          courses: coursesWithRelevance,
          searchResults: searchResults,
          query: query,
          method: 'vector'
        });
      } catch (error) {
        console.error('Vector search failed, falling back to simple search:', error);
      }
    }

    // Fallback to simple text search
    console.log('Using simple text search...');
    const courses = await simpleTextSearch(query, session.user.id);

    return NextResponse.json({
      success: true,
      courses: courses,
      query: query,
      method: 'simple',
      message: courses.length > 0 ? `Found ${courses.length} courses` : 'No courses found'
    });

  } catch (error: any) {
    console.error('Error searching courses:', error);
    return NextResponse.json({ 
      error: 'Failed to search courses',
      details: error.message 
    }, { status: 500 });
  }
} 