import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export async function POST(request: Request) {
  try {
    const { uploadIds } = await request.json();
    
    if (!uploadIds || !Array.isArray(uploadIds)) {
      return NextResponse.json(
        { error: 'uploadIds array is required' },
        { status: 400 }
      );
    }

    let allFlashcards: any[] = [];
    
    // Fetch flashcards for each uploadId
    for (const uploadId of uploadIds) {
      const flashcards = await airtableService.getFlashcards(uploadId);
      allFlashcards = [...allFlashcards, ...flashcards];
    }
    
    return NextResponse.json({ flashcards: allFlashcards });
  } catch (error) {
    console.error('Error fetching multiple flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}
