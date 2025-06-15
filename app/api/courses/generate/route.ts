import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ZillizService } from '@/lib/services/zilliz';
import { EmbeddingService } from '@/lib/services/embeddings';

const NOVITA_API_URL = 'https://api.novita.ai/v3/openai/chat/completions';

async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    // Try Novita AI first (if API key is available)
    if (process.env.NOVITA_API_KEY) {
      console.log('Using Novita AI embeddings for course generation...');
      const embeddingService = new EmbeddingService('novita');
      return await embeddingService.generateEmbeddings(text);
    }
    
    // Fallback to Hugging Face
    console.log('Using Hugging Face embeddings for course generation...');
    const embeddingService = new EmbeddingService('huggingface');
    return await embeddingService.generateEmbeddings(text);
  } catch (error: any) {
    console.error('Failed to generate embeddings:', error.message);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, difficulty, additionalInfo } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Generate course content using Novita AI
    const prompt = `Create a comprehensive and detailed course about ${topic} at ${difficulty || 'beginner'} level. 

Please structure the course with the following format:

**Course Title: [Specific Title]**

**Course Description:**
[Detailed description of what the course covers and what students will learn]

**Course Content:**

**Module 1: [Module Title]**
[Detailed explanation of this module - at least 2-3 paragraphs explaining the concepts, why they're important, and how they relate to the overall topic]

**Module 2: [Module Title]**
[Detailed explanation of this module - at least 2-3 paragraphs explaining the concepts, why they're important, and how they relate to the overall topic]

**Module 3: [Module Title]**
[Detailed explanation of this module - at least 2-3 paragraphs explaining the concepts, why they're important, and how they relate to the overall topic]

**Module 4: [Module Title]**
[Detailed explanation of this module - at least 2-3 paragraphs explaining the concepts, why they're important, and how they relate to the overall topic]

Each module should include:
- Clear explanations of the concepts
- Why these concepts are important
- How they build upon previous modules
- Real-world applications or examples
- Practical insights for learners

Additional focus areas: ${additionalInfo || 'Cover the fundamentals comprehensively'}

Make sure each module has substantial content with detailed explanations, not just bullet points. The content should be educational, engaging, and suitable for ${difficulty || 'beginner'} level learners.`;
    
    const novitaResponse = await fetch(NOVITA_API_URL, {
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

    const rawText = await novitaResponse.text();
    console.log('Novita raw response:', rawText);
    console.log('Novita response status:', novitaResponse.status);

    let novitaData;
    try {
      novitaData = JSON.parse(rawText);
    } catch (e) {
      console.error('Failed to parse Novita response:', e);
      console.error('Raw response was:', rawText);
      return NextResponse.json({ error: 'Invalid response from Novita API', details: rawText }, { status: 500 });
    }

    if (!novitaData.choices || !novitaData.choices[0] || !novitaData.choices[0].message) {
      console.error('Novita API failed:', novitaData);
      return NextResponse.json({ error: 'Failed to generate course content' }, { status: 500 });
    }

    const courseContent = novitaData.choices[0].message.content;
    
    // Create course in database
    const course = await prisma.course.create({
      data: {
        title: `${topic} Course`,
        description: `A ${difficulty || 'beginner'} level course about ${topic}`,
        content: courseContent,
        difficulty: difficulty || 'beginner',
        duration: 60, // Default duration in minutes
        topics: [topic], // Array of topics for PostgreSQL
        userId: session.user.id
      }
    });

    // Generate embeddings using the same provider as search and store in Zilliz
    try {
      const contentChunks = courseContent.match(/.{1,1000}/g) || [];
      
      console.log('Generating embeddings...');
      const embeddings = await Promise.all(contentChunks.map((chunk: string) => generateEmbeddings(chunk)));
      
      // Determine embedding dimension based on provider
      const embeddingDimension = process.env.NOVITA_API_KEY ? 1024 : 384;
      const zillizService = new ZillizService(embeddingDimension);
      await zillizService.initializeCollection();
      await zillizService.storeEmbeddings(course.id, contentChunks, embeddings);
      console.log(`✅ Embeddings stored successfully in Zilliz (${embeddingDimension} dimensions)!`);
    } catch (embeddingError) {
      console.error('Failed to generate/store embeddings:', embeddingError);
      console.log('Course created successfully, but embeddings failed. You can still use simple search.');
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Error generating course:', error);
    return NextResponse.json({ error: 'Failed to generate course' }, { status: 500 });
  }
}