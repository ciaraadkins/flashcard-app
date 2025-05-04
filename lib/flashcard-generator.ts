import OpenAI from 'openai';
import { Flashcard } from '@/types';

interface GenerateFlashcardsParams {
  extractedText: string;
  prompt?: string;
}

export class FlashcardGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateFlashcards({ extractedText, prompt }: GenerateFlashcardsParams): Promise<Omit<Flashcard, 'id'>[]> {
    try {
      const systemPrompt = `You are a helpful study assistant that creates flashcards from text content. 
      Create flashcards in the following format:
      FRONT: [Question or key concept]
      BACK: [Answer or explanation]
      
      Rules:
      - Make cards focused and specific
      - Avoid overly long answers
      - Create clear, testable questions
      - Format each card as shown above
      - Create 5-10 cards per input
      ${prompt ? `Additional instructions: ${prompt}` : ''}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create flashcards from this text:\n\n${extractedText}` }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      return this.parseFlashcards(content);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw new Error('Failed to generate flashcards');
    }
  }

  private parseFlashcards(content: string): Omit<Flashcard, 'id'>[] {
    const cards: Omit<Flashcard, 'id'>[] = [];
    const cardBlocks = content.split('\n\n');

    for (const block of cardBlocks) {
      if (block.includes('FRONT:') && block.includes('BACK:')) {
        const lines = block.split('\n');
        let front = '';
        let back = '';

        for (const line of lines) {
          if (line.startsWith('FRONT:')) {
            front = line.replace('FRONT:', '').trim();
          } else if (line.startsWith('BACK:')) {
            back = line.replace('BACK:', '').trim();
          }
        }

        if (front && back) {
          cards.push({ front, back });
        }
      }
    }

    return cards;
  }
}

// Fallback generator for development
export class MockFlashcardGenerator {
  async generateFlashcards({ extractedText, prompt }: GenerateFlashcardsParams): Promise<Omit<Flashcard, 'id'>[]> {
    // Mock implementation for testing
    return [
      {
        front: 'What is the main concept in this text?',
        back: extractedText.slice(0, 100) + '...',
      },
      {
        front: 'Key idea?',
        back: 'This is a mock flashcard based on the extracted text.',
      },
    ];
  }
}

export function createFlashcardGenerator(): FlashcardGenerator | MockFlashcardGenerator {
  if (process.env.NODE_ENV === 'development' && !process.env.OPENAI_API_KEY) {
    return new MockFlashcardGenerator();
  }
  return new FlashcardGenerator();
}
