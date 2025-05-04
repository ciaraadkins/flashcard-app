import { NextResponse } from 'next/server';
import { createOCRService } from '@/lib/ocr';
import { createFlashcardGenerator } from '@/lib/flashcard-generator';
import { airtableService } from '@/lib/airtable';
import { Flashcard } from '@/types';

// Generate a meaningful title for the upload
function generateUploadTitle(
  cards: Omit<Flashcard, 'id'>[], 
  course?: string, 
  group?: string, 
  prompt?: string
): string {
  // Use group if available, otherwise use course and card count
  if (group) {
    return group;
  }
  
  if (course) {
    return `${course} - ${cards.length} cards`;
  }
  
  // Fallback: use prompt or default title
  if (prompt && prompt.length < 50) {
    return prompt;
  }
  
  return `Flashcards (${cards.length})`;
}

// Generate a group name if none is provided
function generateGroupName(generatedCards: Omit<Flashcard, 'id'>[], prompt?: string): string {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  
  // Try to extract a theme from the first few flashcards
  const frontTexts = generatedCards.slice(0, 3).map(card => card.front);
  let theme = '';
  
  // Look for common keywords or topics
  const keywords = {
    'grammar': ['verb', 'tense', 'conjugation', 'subject', 'pronoun'],
    'vocabulary': ['word', 'definition', 'meaning', 'synonym'],
    'conversation': ['how to', 'phrase', 'expression', 'saying', 'response'],
    'survival phrases': ['emergency', 'help', 'where', 'how much', 'please', 'thank you']
  };
  
  for (const [category, words] of Object.entries(keywords)) {
    if (frontTexts.some(text => 
      words.some(word => text.toLowerCase().includes(word))
    )) {
      theme = category;
      break;
    }
  }
  
  // If theme found, use it
  if (theme) {
    return `${theme} - ${dateString}`;
  }
  
  // If prompt provided and short enough, use it
  if (prompt && prompt.length < 30) {
    return `${prompt} - ${dateString}`;
  }
  
  // Default to date-based name
  return `Study Set - ${dateString}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const course = formData.get('course') as string;
    const group = formData.get('group') as string;
    
    // Get all uploaded images
    const images: File[] = [];
    for (let i = 0; i < 10; i++) {
      const image = formData.get(`image${i}`) as File | null;
      if (image) images.push(image);
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Process images with OCR
    const ocrService = createOCRService();
    const extractedTexts: string[] = [];
    
    for (const image of images) {
      const buffer = await image.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');
      const imageData = `data:${image.type};base64,${base64Image}`;
      
      const text = await ocrService.extractText(imageData);
      extractedTexts.push(text);
    }

    // Combine all extracted text
    const combinedText = extractedTexts.join('\n\n---\n\n');

    // Generate flashcards
    const flashcardGenerator = createFlashcardGenerator();
    const generatedCards = await flashcardGenerator.generateFlashcards({
      extractedText: combinedText,
      prompt,
    });

    // Generate a meaningful title based on the content
    const title = generateUploadTitle(generatedCards, course, group, prompt);

    // If no group is provided, generate one automatically
    const finalGroup = group || generateGroupName(generatedCards, prompt);

    // Create upload record
    const upload = await airtableService.createUpload({
      date: new Date().toISOString(),
      summary: title,
      course: course || undefined,
      imageCount: images.length,
    });

    // Create flashcards in Airtable with upload ID
    const cardsWithUploadId = generatedCards.map(card => ({
      ...card,
      uploadId: upload.id,
      course: course || undefined,
      group: finalGroup, // Use finalGroup instead of group
    }));

    const savedCards = await airtableService.createFlashcards(cardsWithUploadId);

    return NextResponse.json({
      uploadId: upload.id,
      flashcards: savedCards,
    });
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: 'Failed to process images' },
      { status: 500 }
    );
  }
}
