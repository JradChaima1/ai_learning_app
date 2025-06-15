'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Vapi from '@vapi-ai/web';
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

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

interface VoiceQuizInterfaceProps {
  quiz: Quiz;
  onComplete: (score: number) => void;
}

export default function VoiceQuizInterface({ quiz, onComplete }: VoiceQuizInterfaceProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const vapiRef = useRef<any>(null);

  useEffect(() => {
    // Initialize VAPI
    if (typeof window !== 'undefined') {
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY || '');

      // Set up event listeners
      vapiRef.current.on('speech-start', () => {
        setIsSpeaking(true);
      });

      vapiRef.current.on('speech-end', () => {
        setIsSpeaking(false);
      });

      vapiRef.current.on('message', (message: any) => {
        if (message.role === 'user') {
          setTranscript(message.content);
          handleVoiceAnswer(message.content.toLowerCase().trim());
        }
      });

      vapiRef.current.on('call-start', () => {
        setIsListening(true);
        toast.success('Voice quiz started!');
      });

      vapiRef.current.on('call-end', () => {
        setIsListening(false);
        setIsStarted(false);
      });

      vapiRef.current.on('error', (error: any) => {
        console.error('VAPI error:', error);
        toast.error('Voice AI error. Please try again.');
        setIsListening(false);
      });
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const startVoiceQuiz = async () => {
    if (!vapiRef.current) {
      toast.error('VAPI not initialized');
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      toast.error('VAPI API key not found. Please check your environment variables.');
      return;
    }

    try {
      setIsStarted(true);
      
      // Create the system prompt for the quiz
      const systemPrompt = `You are a quiz assistant conducting a voice quiz. The quiz is titled "${quiz.title}" from the course "${quiz.course.title}". 

You will ask the user ${quiz.questions.length} multiple choice questions. For each question:
1. Read the question clearly
2. Present all 4 options (A, B, C, D)
3. Ask the user to respond with A, B, C, or D
4. Provide immediate feedback on whether they're correct
5. Move to the next question

Here are the questions:
${quiz.questions.map((q, index) => `
Question ${index + 1}: ${q.question}
A) ${q.options[0]}
B) ${q.options[1]}
C) ${q.options[2]}
D) ${q.options[3]}
Correct Answer: ${String.fromCharCode(65 + q.correct)}
`).join('\n')}

Start by introducing yourself and the quiz. Be encouraging and helpful throughout the quiz. Keep responses concise and clear.`;

      // Create the assistant configuration using CreateAssistantDTO type
      const vapiAssistant: CreateAssistantDTO = {
        name: 'Quiz Assistant',
        firstMessage: `Hello! I'm your quiz assistant. I'll be conducting a voice quiz titled "${quiz.title}" from the course "${quiz.course.title}". This quiz has ${quiz.questions.length} multiple choice questions. Are you ready to begin?`,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-3',
          language: 'en',
        },
        voice: {
          provider: '11labs',
          voiceId: 'sarah',
          stability: 0.4,
          similarityBoost: 0.8,
          speed: 1,
          style: 0.5,
          useSpeakerBoost: true,
        },
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
          ],
        },
      };

      console.log('Starting VAPI call with config:', vapiAssistant);

      // Start the VAPI call with the properly typed assistant configuration
      await vapiRef.current.start(vapiAssistant);

      toast.success('Voice quiz initiated! Start speaking...');

    } catch (error: any) {
      console.error('Error starting voice quiz:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      toast.error(`Failed to start voice quiz: ${error.message || 'Unknown error'}`);
      setIsStarted(false);
    }
  };

  const stopVoiceQuiz = async () => {
    if (vapiRef.current) {
      await vapiRef.current.stop();
      setIsListening(false);
      setIsStarted(false);
    }
  };

  const handleVoiceAnswer = (transcript: string) => {
    let answer = -1;
    
    // Parse voice input for answer
    if (transcript.includes('a') || transcript.includes('option a') || transcript.includes('first')) {
      answer = 0;
    } else if (transcript.includes('b') || transcript.includes('option b') || transcript.includes('second')) {
      answer = 1;
    } else if (transcript.includes('c') || transcript.includes('option c') || transcript.includes('third')) {
      answer = 2;
    } else if (transcript.includes('d') || transcript.includes('option d') || transcript.includes('fourth')) {
      answer = 3;
    }

    if (answer !== -1) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = answer;
      setAnswers(newAnswers);

      // Move to next question or finish
      setTimeout(() => {
        if (currentQuestion < quiz.questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          finishQuiz();
        }
      }, 1000);
    }
  };

  const finishQuiz = () => {
    const correctAnswers = answers.filter((answer, index) => 
      answer === quiz.questions[index].correct
    ).length;

    setScore(correctAnswers);
    setIsSubmitted(true);
    onComplete(correctAnswers);

    // Stop the VAPI call
    if (vapiRef.current) {
      vapiRef.current.stop();
    }

    toast.success(`Voice quiz completed! Score: ${correctAnswers}/${quiz.questions.length}`);
  };

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Voice Quiz Not Supported</h2>
          <p className="text-center text-gray-600 mb-4">
            Your browser doesn't support VAPI voice AI. 
            Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
          <div className="text-center">
            <Link href={`/quizzes/${quiz.id}/take`} className="text-blue-600 hover:underline">
              Take Quiz Online Instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Voice Quiz: {quiz.title}</h2>
        
        {!isStarted ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Take this quiz using VAPI's advanced voice AI! The AI assistant will read questions aloud 
                and you can respond by speaking your answer.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click "Start Voice Quiz" to begin</li>
                <li>• VAPI AI will read each question and all 4 options</li>
                <li>• Say "A", "B", "C", or "D" to answer</li>
                <li>• Get immediate AI-powered feedback on your answers</li>
                <li>• Complete all questions to see your final score</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={startVoiceQuiz}
                className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Start VAPI Voice Quiz
              </button>
            </div>
          </div>
        ) : !isSubmitted ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                isListening ? 'bg-red-500 animate-pulse' : 
                isSpeaking ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              
          
              <p className="text-gray-600 mb-2">
                {isListening ? 'Listening...' : 
                 isSpeaking ? 'VAPI AI Speaking...' : 'Ready for your answer'}
              </p>
              
              {transcript && (
                <p className="text-sm text-gray-500">
                  You said: "{transcript}"
                </p>
              )}
            </div>


            <div className="text-center">
              <button
                onClick={stopVoiceQuiz}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Stop Voice Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="border border-gray-200 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Voice Quiz Results</h3>
              <p className="text-lg mb-2">
                You scored <span className="font-bold text-blue-600">{score}</span> out of <span className="font-bold">{quiz.questions.length}</span>
              </p>
              <p className="text-gray-600">
                {score === quiz.questions.length ? 'Perfect! 🎉' : 
                 score >= quiz.questions.length * 0.8 ? 'Great job! 👍' :
                 score >= quiz.questions.length * 0.6 ? 'Good effort! 👏' : 'Keep practicing! 💪'}
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsStarted(false);
                setIsSubmitted(false);
                setScore(0);
                setAnswers([]);
                setCurrentQuestion(0);
                setTranscript('');
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Take Quiz Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 