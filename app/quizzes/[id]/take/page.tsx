'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/quizzes/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load quiz');
        }
        
        const data = await response.json();
        
        if (!data.quiz) {
          throw new Error('No quiz data received');
        }
        
        setQuiz(data.quiz);
        setAnswers(new Array(data.quiz.questions.length).fill(-1));
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [params]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (isSubmitted) return;
    
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.includes(-1)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    const correctAnswers = answers.filter((answer, index) => 
      answer === quiz!.questions[index].correct
    ).length;

    setScore(correctAnswers);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading quiz...</p>
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

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
          <p className="text-gray-600 mb-4">This quiz doesn't have any questions yet.</p>
          <Link href={`/quizzes/${quiz.id}`} className="text-blue-600 hover:underline">
            Back to Quiz
          </Link>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  
  if (!question) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
          <p className="text-gray-600 mb-4">The requested question could not be found.</p>
          <Link href={`/quizzes/${quiz.id}`} className="text-blue-600 hover:underline">
            Back to Quiz
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/quizzes/${quiz.id}`} className="text-blue-600 hover:underline">
            ← Back to Quiz
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-4">Course: {quiz.course.title}</p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </div>

        {!isSubmitted ? (
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">
                {question.question}
              </h2>
              
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={answers[currentQuestion] === index}
                      onChange={() => handleAnswerSelect(currentQuestion, index)}
                      className="sr-only"
                    />
                    <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-sm mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={answers.includes(-1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="border border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
              <p className="text-lg mb-2">
                You scored <span className="font-bold text-blue-600">{score}</span> out of <span className="font-bold">{quiz.questions.length}</span>
              </p>
              <p className="text-gray-600">
                {score === quiz.questions.length ? 'Perfect! 🎉' : 
                 score >= quiz.questions.length * 0.8 ? 'Great job! 👍' :
                 score >= quiz.questions.length * 0.6 ? 'Good effort! 👏' : 'Keep practicing! 💪'}
              </p>
            </div>
            
            <div className="space-x-4">
              <Link
                href={`/quizzes/${quiz.id}`}
                className="inline-block px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Review Quiz
              </Link>
              <Link
                href={`/courses/${quiz.course.title}`}
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Course
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 