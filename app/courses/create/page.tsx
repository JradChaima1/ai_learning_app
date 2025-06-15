import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CourseGenerationForm from '@/app/components/CourseGenerationForm';

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-purple-600">AILearning</h1>
        </div>
        <nav className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          <a href="/courses" className="px-3 py-1 md:px-4 md:py-2 bg-purple-100 text-purple-600 rounded-md text-sm md:text-base">Back to Courses</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Create New AI-Generated Course</h2>
          <p className="text-gray-600">Generate a comprehensive course with AI assistance</p>
        </div>
        <CourseGenerationForm />
      </main>
    </div>
  );
}