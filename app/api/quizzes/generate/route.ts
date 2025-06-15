import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, numberOfQuestions = 5 } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get course content
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Generate quiz questions using Novita AI
    const prompt = `Based on the following course content, generate ${numberOfQuestions} multiple-choice questions with 4 options each. 

IMPORTANT: Format your response exactly as follows:

Question 1: [Your question here]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Correct answer: [A, B, C, or D]

Question 2: [Your question here]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Correct answer: [A, B, C, or D]

Continue this format for all ${numberOfQuestions} questions.

Course content:
${course.content}`;
    
    const response = await fetch('https://api.novita.ai/v3/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NOVITA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json({ error: 'Failed to generate quiz questions' }, { status: 500 });
    }

    // Parse the generated questions
    // This is a simplified parsing logic - you might need to adjust based on actual output format
    const generatedText = data.choices[0].message.content;
    console.log('Generated quiz text:', generatedText);
    
    const questionBlocks = generatedText.split(/\n\s*\n/).filter((block: string) => block.trim().startsWith('Question'));
    console.log('Question blocks found:', questionBlocks.length);
    
    const parsedQuestions = questionBlocks.map((block: string) => {
      const lines = block.split('\n').filter((line: string) => line.trim());
      const question = lines[0].replace(/^Question \d+:\s*/, '');
      const options = lines.slice(1, 5).map((line: string) => line.replace(/^[A-D]\.\s*/, ''));
      const correctLine = lines.find((line: string) => line.includes('Correct answer:'));
      let correct = 0;
      
      if (correctLine) {
        const correctAnswer = correctLine.replace(/Correct answer:\s*/, '').trim();
        if (correctAnswer === 'A') correct = 0;
        else if (correctAnswer === 'B') correct = 1;
        else if (correctAnswer === 'C') correct = 2;
        else if (correctAnswer === 'D') correct = 3;
        else correct = parseInt(correctAnswer) % 4; // Fallback for numeric
      }
      
      return { question, options, correct };
    });

    console.log('Parsed questions:', parsedQuestions);

    // If no questions were parsed, try alternative parsing
    if (parsedQuestions.length === 0) {
      console.log('No questions parsed, trying alternative parsing...');
      
      // Try to parse questions with different formats
      const alternativeQuestions = [];
      const lines = generatedText.split('\n').filter((line: string) => line.trim());
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^\d+\./) || line.match(/^Question \d+:/)) {
          // Found a question
          const question = line.replace(/^\d+\.\s*/, '').replace(/^Question \d+:\s*/, '');
          const options = [];
          let correct = 0;
          
          // Look for options in next few lines
          for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
            const optionLine = lines[j].trim();
            if (optionLine.match(/^[A-D]\./)) {
              const option = optionLine.replace(/^[A-D]\.\s*/, '');
              options.push(option);
              
              // Check if this is marked as correct
              if (optionLine.includes('correct') || optionLine.includes('Correct')) {
                correct = options.length - 1;
              }
            }
          }
          
          if (question && options.length >= 2) {
            alternativeQuestions.push({
              question,
              options: options.slice(0, 4), // Ensure max 4 options
              correct: Math.min(correct, 3) // Ensure correct is 0-3
            });
          }
        }
      }
      
      if (alternativeQuestions.length > 0) {
        console.log('Alternative parsing found questions:', alternativeQuestions);
        parsedQuestions.push(...alternativeQuestions);
      }
    }

    // If still no questions, create a fallback quiz
    if (parsedQuestions.length === 0) {
      console.log('Creating fallback quiz with sample questions...');
      parsedQuestions.push(
        {
          question: "What is the main topic of this course?",
          options: ["The course topic", "Something else", "Another topic", "None of the above"],
          correct: 0
        },
        {
          question: "Which of the following best describes this course?",
          options: ["Beginner level", "Intermediate level", "Advanced level", "Expert level"],
          correct: 0
        }
      );
    }

    // Create quiz in database
    const quiz = await prisma.quiz.create({
      data: {
        title: `Quiz for ${course.title}`,
        courseId: course.id,
        questions: {
          create: parsedQuestions.map((q: any) => ({
            question: q.question,
            options: q.options, // Array of options for PostgreSQL
            correct: q.correct
          }))
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}