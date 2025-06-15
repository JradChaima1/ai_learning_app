'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface VoiceQuizButtonProps {
  quizId: string;
}

export default function VoiceQuizButton({ quizId }: VoiceQuizButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const handleStartVoiceQuiz = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/quizzes/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizId,
          phoneNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start voice quiz');
      }

      toast.success('Voice call initiated! You will receive a call shortly.');
      setShowPhoneInput(false);
      setPhoneNumber('');
    } catch (error) {
      console.error('Error starting voice quiz:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start voice quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!showPhoneInput ? (
        <button
          onClick={() => setShowPhoneInput(true)}
          className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          Take Quiz via Voice Call
        </button>
      ) : (
        <div className="flex flex-col space-y-2">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleStartVoiceQuiz}
              disabled={isLoading}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Initiating...' : 'Start Voice Quiz'}
            </button>
            <button
              onClick={() => setShowPhoneInput(false)}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}