
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New AI-Generated Course</h1>
      <CourseGenerationForm />
    </div>
  );
}