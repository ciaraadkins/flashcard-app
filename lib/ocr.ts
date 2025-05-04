import OpenAI from 'openai';

export interface OCRService {
  extractText(imageData: string): Promise<string>;
}

export class OpenAIOCRService implements OCRService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async extractText(imageData: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this image. Return only the text content, nothing else."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error('Failed to extract text from image');
    }
  }
}

export class MockOCRService implements OCRService {
  async extractText(imageData: string): Promise<string> {
    // Mock implementation for testing
    return 'This is a mock extracted text from the image.';
  }
}

// Factory function to create the OCR service
export function createOCRService(): OCRService {
  if (process.env.NODE_ENV === 'development' && !process.env.OPENAI_API_KEY) {
    return new MockOCRService();
  }
  return new OpenAIOCRService();
}
