export class VAPIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.vapi.ai/v1';

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || '';
  }

  async createAssistant(name: string, voiceId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/assistants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          name,
          voice_id: voiceId,
          model: 'gpt-4',
          instructions: 'You are an educational assistant helping students with their courses and quizzes.'
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating VAPI assistant:', error);
      throw new Error('Failed to create voice assistant');
    }
  }

  async createPhoneCall(assistantId: string, phoneNumber: string, quizData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/phone-calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          assistant_id: assistantId,
          to: phoneNumber,
          from: process.env.VAPI_PHONE_NUMBER,
          first_message: `Hello! I'm your AI tutor. I'd like to help you with a quiz about ${quizData.title}. Are you ready to begin?`,
          metadata: {
            quiz_id: quizData.id,
            questions: JSON.stringify(quizData.questions)
          }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating VAPI phone call:', error);
      throw new Error('Failed to initiate voice call');
    }
  }

  async getCallStatus(callId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/phone-calls/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting call status:', error);
      throw new Error('Failed to get call status');
    }
  }
}