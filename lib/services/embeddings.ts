// Multi-provider embedding service
export class EmbeddingService {
  private provider: 'openai' | 'huggingface' | 'cohere' | 'novita';

  constructor(provider: 'openai' | 'huggingface' | 'cohere' | 'novita' = 'huggingface') {
    this.provider = provider;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    switch (this.provider) {
      case 'openai':
        return this.generateOpenAIEmbeddings(text);
      case 'huggingface':
        return this.generateHuggingFaceEmbeddings(text);
      case 'cohere':
        return this.generateCohereEmbeddings(text);
      case 'novita':
        return this.generateNovitaEmbeddings(text);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private async generateOpenAIEmbeddings(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  private async generateHuggingFaceEmbeddings(text: string): Promise<number[]> {
    // ✅ FIXED: Use a more reliable model for embeddings
    const response = await fetch(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`
        },
        body: JSON.stringify({
          inputs: text, // Single string for this model
          options: { wait_for_model: true }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('All Hugging Face API attempts failed. Last error:', errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('HF Response type:', typeof data, 'Array?', Array.isArray(data));

    // Handle different response formats
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        // Check if it's a single sentence embedding (2D array with one embedding)
        if (data.length === 1) {
          return data[0]; // Return the single embedding
        } else {
          // Multiple token embeddings - do mean pooling
          const meanEmbedding = data.reduce((acc: number[], tokenEmbedding: number[], index: number) => {
            if (index === 0) return [...tokenEmbedding];
            return acc.map((val, i) => val + tokenEmbedding[i]);
          }, [] as number[]).map((val: number) => val / data.length);
          return meanEmbedding;
        }
      } else {
        // Single embedding vector (1D array)
        return data;
      }
    }

    throw new Error('Unexpected response format from Hugging Face API');
  }

  private async generateCohereEmbeddings(text: string): Promise<number[]> {
    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`
      },
      body: JSON.stringify({
        texts: [text],
        model: 'embed-english-v3.0',
        input_type: 'search_document'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cohere API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.embeddings[0];
  }

  private async generateNovitaEmbeddings(text: string): Promise<number[]> {
    const response = await fetch('https://api.novita.ai/v3/openai/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NOVITA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'baai/bge-m3',
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`Novita API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }
}