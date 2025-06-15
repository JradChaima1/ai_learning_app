import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get all user's courses
    const allCourses = await prisma.course.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Simple text-based search
    const searchTerms = query.toLowerCase().split(' ').filter((term: string) => term.length > 0);
    
    const searchResults = allCourses.map(course => {
      const searchableText = [
        course.title,
        course.description,
        course.content,
        course.difficulty,
        ...course.topics
      ].join(' ').toLowerCase();

      let score = 0;
      let matches = 0;

      // Calculate relevance score
      searchTerms.forEach((term: string) => {
        const termCount = (searchableText.match(new RegExp(term, 'g')) || []).length;
        if (termCount > 0) {
          matches++;
          score += termCount;
        }
      });

      // Bonus for exact matches
      if (searchableText.includes(query.toLowerCase())) {
        score += 10;
      }

      // Bonus for title matches
      if (course.title.toLowerCase().includes(query.toLowerCase())) {
        score += 5;
      }

      // Calculate relevance percentage
      const relevanceScore = matches > 0 ? Math.min(score / searchTerms.length, 1) : 0;

      // Extract matching content snippets
      const matchingContent: string[] = [];
      searchTerms.forEach((term: string) => {
        const regex = new RegExp(`.{0,50}${term}.{0,50}`, 'gi');
        const matches = course.content.match(regex);
        if (matches) {
          matchingContent.push(...matches.slice(0, 2));
        }
      });

      return {
        ...course,
        relevanceScore: 1 - relevanceScore, // Invert so lower = better (like vector search)
        matchingContent: [...new Set(matchingContent)].slice(0, 2), // Remove duplicates
        matchCount: matches,
        totalScore: score
      };
    }).filter(course => course.relevanceScore < 1); // Only include courses with matches

    // Sort by relevance (lower score = more relevant)
    searchResults.sort((a, b) => a.relevanceScore - b.relevanceScore);

    return NextResponse.json({
      success: true,
      courses: searchResults,
      query: query,
      totalResults: searchResults.length
    });

  } catch (error) {
    console.error('Error searching courses:', error);
    return NextResponse.json({ error: 'Failed to search courses' }, { status: 500 });
  }
} 