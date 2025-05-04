import { NextResponse } from 'next/server';
import { createOCRService } from '@/lib/ocr';
import { createFlashcardGenerator } from '@/lib/flashcard-generator';
import { airtableService } from '@/lib/airtable';

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

    // Create upload record
    const upload = await airtableService.createUpload({
      date: new Date().toISOString(),
      summary: generatedCards[0]?.front || 'Flashcards created',
      course: course || undefined,
      imageCount: images.length,
    });

    // Create flashcards in Airtable with upload ID
    const cardsWithUploadId = generatedCards.map(card => ({
      ...card,
      uploadId: upload.id,
      course: course || undefined,
      group: group || undefined,
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
