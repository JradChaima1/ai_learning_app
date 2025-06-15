import { prisma } from './prisma';

// Helper function to retry database operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`Database operation attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max retries exceeded');
}

// Helper function to check if error is a database connection issue
export function isDatabaseConnectionError(error: any): boolean {
  const errorMessage = error.message || '';
  return (
    errorMessage.includes('Can\'t reach database server') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('Connection terminated') ||
    errorMessage.includes('Connection closed')
  );
}

// Wrapper for common database operations
export const db = {
  // Course operations
  findCourse: (id: string) => retryOperation(() => 
    prisma.course.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        quizzes: true
      }
    })
  ),
  
  findCoursesByUser: (userId: string) => retryOperation(() =>
    prisma.course.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    })
  ),
  
  createCourse: (data: any) => retryOperation(() =>
    prisma.course.create({ data })
  ),
  
  // User operations
  findUser: (id: string) => retryOperation(() =>
    prisma.user.findUnique({ where: { id } })
  ),
  
  // Quiz operations
  findQuizzesByCourse: (courseId: string) => retryOperation(() =>
    prisma.quiz.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' }
    })
  )
}; 