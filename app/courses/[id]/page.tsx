import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, isDatabaseConnectionError } from "@/lib/database";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
  let course;
  try {
    course = await db.findCourse(id);
  } catch (error: any) {
    console.error('Failed to fetch course:', error);
    
    // Check if it's a database connection error
    if (isDatabaseConnectionError(error)) {
      return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Database Connection Error</h1>
            <p className="text-gray-600 mb-6">
              We're having trouble connecting to the database. This might be a temporary issue.
            </p>
            <div className="space-y-4">
              <Link
                href="/courses"
                className="inline-block bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Back to Courses
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="block mx-auto bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // For other errors, throw to show the default error page
    throw error;
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-purple-600">AILearning</h1>
        </div>
        <nav className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          <Link href="/courses" className="px-3 py-1 md:px-4 md:py-2 bg-purple-100 text-purple-600 rounded-md text-sm md:text-base">Back to Courses</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
        <div className="flex items-center text-gray-500 mb-6">
          <span>By {course.user.name || 'Anonymous'}</span>
          <span className="mx-2">•</span>
          <span>Difficulty: {course.difficulty}</span>
          {course.duration && (
            <>
              <span className="mx-2">•</span>
              <span>{course.duration} minutes</span>
            </>
          )}
        </div>

        {course.description && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{course.description}</p>
          </div>
        )}

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Course Content</h2>
          <div className="whitespace-pre-wrap text-gray-700">{course.content}</div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Quizzes</h2>
          {course.quizzes.length > 0 ? (
            <div className="space-y-4">
              {course.quizzes.map((quiz) => (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <div className="space-x-2">
                      <Link
                        href={`/quizzes/${quiz.id}`}
                        className="bg-purple-600 text-white py-1 px-3 rounded-md text-sm hover:bg-purple-700 transition-colors"
                      >
                        Take Quiz
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">No quizzes available for this course yet.</p>
              {session?.user && session.user.id === course.userId && (
                <Link
                  href={`/quizzes/create?courseId=${course.id}`}
                  className="text-purple-600 hover:underline"
                >
                  Create a quiz for this course
                </Link>
              )}
            </div>
          )}

          {session?.user && session.user.id === course.userId && course.quizzes.length > 0 && (
            <div className="mt-4">
              <Link
                href={`/quizzes/create?courseId=${course.id}`}
                className="text-purple-600 hover:underline"
              >
                Create another quiz
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}