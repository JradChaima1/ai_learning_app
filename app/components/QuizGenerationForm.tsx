'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface QuizGenerationFormProps {
  courseId: string;
  courseTitle: string;
}

export default function QuizGenerationForm({ courseId, courseTitle }: QuizGenerationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          numberOfQuestions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (data.success && data.quiz) {
        toast.success('Quiz generated successfully!');
        router.push(`/quizzes/${data.quiz.id}`);
        router.refresh();
      } else {
        throw new Error('Quiz generation failed - no quiz data returned');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Questions
          </label>
          <input
            type="number"
            id="numberOfQuestions"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </form>
    </div>
  );
} 