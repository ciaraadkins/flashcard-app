import OpenAI from 'openai';

export class ContentTitleGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateContentTitle(flashcards: Array<{front: string; back: string}>): Promise<string> {
    try {
      // Take first 3-5 flashcards as sample
      const sampleCards = flashcards.slice(0, 5);
      const sampleText = sampleCards
        .map(card => `Q: ${card.front}\nA: ${card.back}`)
        .join('\n\n');

      const systemPrompt = `You are a helpful assistant that creates concise, descriptive titles for study materials.
      Given a sample of flashcards, analyze their content and create a short, descriptive title (5-10 words max).
      
      The title should:
      - Capture the main topic/theme
      - Be clear and concise
      - Be useful for organizing study materials
      - Avoid generic terms like "Study Set" or "Flashcards"
      
      Examples of good titles:
      - French Verb Conjugations - Past Tense
      - Chapter 5 Vocabulary
      - Basic Math Formulas
      - Spanish Travel Phrases
      - Biology Cell Structure
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a title for flashcards covering this content:\n\n${sampleText}` }
        ],
        temperature: 0.5,
        max_tokens: 30,
      });

      const title = response.choices[0]?.message?.content?.trim();
      if (!title) throw new Error('No title generated');

      // Clean up the title (remove quotes, excess whitespace)
      return title.replace(/['"]/g, '').trim();
    } catch (error) {
      console.error('Error generating content title:', error);
      throw new Error('Failed to generate content title');
    }
  }
}

// Fallback generator for development
export class MockContentTitleGenerator {
  async generateContentTitle(flashcards: Array<{front: string; back: string}>): Promise<string> {
    // Simply extract the first topic from the flashcards as a fallback
    const firstFront = flashcards[0]?.front || '';
    const topicMatch = firstFront.match(/(?:What (?:is|are)|Translate|Define)\s+(.+?)(?:\?|$)/);
    return topicMatch ? topicMatch[1] : 'Study Material';
  }
}

export function createContentTitleGenerator(): ContentTitleGenerator | MockContentTitleGenerator {
  if (process.env.NODE_ENV === 'development' && !process.env.OPENAI_API_KEY) {
    return new MockContentTitleGenerator();
  }
  return new ContentTitleGenerator();
}
