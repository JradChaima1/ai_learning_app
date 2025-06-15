'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VoiceQuizInterface from '@/app/components/VoiceQuizInterface';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

interface Quiz {
  id: string;
  title: string;
  course: {
    title: string;
  };
  questions: Question[];
}

export default function VoiceQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/quizzes/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load quiz');
        }
        
        const data = await response.json();
        setQuiz(data.quiz);
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast.error('Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [params]);

  const handleQuizComplete = (score: number) => {
    toast.success(`Voice quiz completed! Score: ${score}/${quiz?.questions.length}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading voice quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <Link href="/courses" className="text-blue-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/quizzes/${quiz.id}`} className="text-blue-600 hover:underline">
          ← Back to Quiz
        </Link>
      </div>

      <VoiceQuizInterface quiz={quiz} onComplete={handleQuizComplete} />
    </div>
  );
} 