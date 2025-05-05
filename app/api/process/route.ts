import { NextResponse } from 'next/server';
import { createOCRService } from '@/lib/ocr';
import { createFlashcardGenerator } from '@/lib/flashcard-generator';
import { createContentTitleGenerator } from '@/lib/content-title-generator';
import { airtableService } from '@/lib/airtable';
import { Flashcard } from '@/types';

// Generate a meaningful title for the upload
function generateUploadTitle(
  cards: Omit<Flashcard, 'id'>[], 
  course?: string, 
  group?: string, 
  contentDescription?: string, // New parameter
  incremental?: number // Track upload number within a group
): string {
  // If user provided content description, use it
  if (contentDescription) {
    return `${contentDescription} - ${cards.length} cards`;
  }
  
  // If group is provided but no description, use group name with incremental
  if (group && incremental && incremental > 1) {
    return `${group} #${incremental} - ${cards.length} cards`;
  }
  
  // If course but no group, use course and card count
  if (course) {
    const increment = incremental ? ` #${incremental}` : '';
    return `${course}${increment} - ${cards.length} cards`;
  }
  
  // Default with incremental
  const increment = incremental ? ` #${incremental}` : '';
  return `Study Set${increment} - ${cards.length} cards`;
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

// Get upload count for a specific group
async function getUploadCountInGroup(course: string, group: string): Promise<number> {
  const uploads = await airtableService.getUploads();
  const filteredUploads = uploads.filter(upload => 
    upload.course === course && upload.summary?.includes(group)
  );
  return filteredUploads.length + 1; // Return next number in sequence
}

export async function POST(request: Request) {
  try {
    console.log('Processing request - start');
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const course = formData.get('course') as string;
    const group = formData.get('group') as string;
    const contentDescription = formData.get('contentDescription') as string; // Get content description
    
    console.log('Form data:', { course, group, contentDescription, prompt: prompt ? 'provided' : 'empty' });
    
    // Get all uploaded images
    const images: File[] = [];
    for (let i = 0; i < 10; i++) {
      const image = formData.get(`image${i}`) as File | null;
      if (image) images.push(image);
    }

    console.log('Images found:', images.length);
    
    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Process images with OCR
    console.log('Starting OCR process...');
    const ocrService = createOCRService();
    const extractedTexts: string[] = [];
    
    for (const image of images) {
      const buffer = await image.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');
      const imageData = `data:${image.type};base64,${base64Image}`;
      
      console.log('Extracting text from image...');
      const text = await ocrService.extractText(imageData);
      extractedTexts.push(text);
      console.log('Text extracted, length:', text.length);
    }

    // Combine all extracted text
    const combinedText = extractedTexts.join('\n\n---\n\n');
    console.log('Combined text length:', combinedText.length);

    // Generate flashcards
    console.log('Generating flashcards...');
    const flashcardGenerator = createFlashcardGenerator();
    const generatedCards = await flashcardGenerator.generateFlashcards({
      extractedText: combinedText,
      prompt,
      imageCount: images.length, // Pass the image count
    });
    console.log('Flashcards generated:', generatedCards.length);

    // If no content description provided, generate one using AI
    let finalContentDescription = contentDescription;
    if (!contentDescription && generatedCards.length > 0) {
      try {
        console.log('Generating content title with AI...');
        const contentTitleGenerator = createContentTitleGenerator();
        finalContentDescription = await contentTitleGenerator.generateContentTitle(generatedCards);
        console.log('AI-generated content title:', finalContentDescription);
      } catch (error) {
        console.error('Failed to generate content title:', error);
        // Continue without AI-generated title
      }
    }

    // If no group is provided, generate one automatically
    const finalGroup = group || generateGroupName(generatedCards, prompt);
    console.log('Final group:', finalGroup);

    // Get incremental number for uploads within the same group
    const incrementalNumber = await getUploadCountInGroup(course, finalGroup);
    console.log('Incremental number:', incrementalNumber);

    // Generate a meaningful title based on the content
    const title = generateUploadTitle(
      generatedCards, 
      course, 
      finalGroup, 
      finalContentDescription,
      incrementalNumber
    );
    console.log('Generated title:', title);

    // Create upload record with focusPrompt
    console.log('Creating upload record...');
    const upload = await airtableService.createUpload({
      date: new Date().toISOString(),
      summary: title,
      course: course || undefined,
      imageCount: images.length,
      focusPrompt: prompt || undefined, // Save the focus prompt
    });
    console.log('Upload created:', upload.id);

    // Create flashcards in Airtable with upload ID
    const cardsWithUploadId = generatedCards.map(card => ({
      ...card,
      uploadId: upload.id,
      course: course || undefined,
      group: finalGroup, // Use finalGroup instead of group
    }));

    console.log('Saving flashcards to Airtable...');
    const savedCards = await airtableService.createFlashcards(cardsWithUploadId);
    console.log('Flashcards saved:', savedCards.length);

    return NextResponse.json({
      uploadId: upload.id,
      flashcards: savedCards,
    });
  } catch (error) {
    console.error('Error processing images:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Failed to process images' },
      { status: 500 }
    );
  }
}
