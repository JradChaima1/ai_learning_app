import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuizGenerationForm from "@/app/components/QuizGenerationForm";

export default async function CreateQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { courseId } = await searchParams;

  if (!courseId) {
    redirect('/courses');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, userId: true }
  });

  if (!course) {
    redirect('/courses');
  }

  // Check if user owns the course
  if (course.userId !== session.user.id) {
    redirect('/courses');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Create Quiz for {course.title}</h1>
      <QuizGenerationForm courseId={course.id} courseTitle={course.title} />
    </div>
  );
}