import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import VoiceQuizInterface from "@/app/components/VoiceQuizInterface";

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  const { id } = await params;
  
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          title: true
        }
      },
      questions: true
    }
  });

  if (!quiz) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/courses/${quiz.courseId}`} className="text-blue-600 hover:underline">
            ← Back to Course
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600 mb-8">Course: {quiz.course.title}</p>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Questions ({quiz.questions.length})</h2>
          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Question {index + 1}: {question.question}
                  </h3>
                </div>
                <div className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-sm mr-3">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className={optionIndex === question.correct ? "font-semibold text-green-600" : ""}>
                        {option}
                        {optionIndex === question.correct && " (Correct Answer)"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">💻 Take Quiz Online</h3>
            <p className="text-gray-600 mb-4">
              Take this quiz on your computer with a visual interface.
            </p>
            <Link
              href={`/quizzes/${quiz.id}/take`}
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Online Quiz
            </Link>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">🎤 Take Quiz by Voice</h3>
            <p className="text-gray-600 mb-4">
              Take this quiz using your voice with browser speech recognition.
            </p>
            <Link
              href={`/quizzes/${quiz.id}/voice`}
              className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Start Voice Quiz
            </Link>
          </div>
        </div>

        <div className="flex space-x-4">
          <Link
            href={`/quizzes/create?courseId=${quiz.courseId}`}
            className="text-blue-600 hover:underline"
          >
            Create Another Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}