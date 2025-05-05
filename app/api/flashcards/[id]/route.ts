import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Received flashcards request for:', params.id);
    
    // Check if id contains comma (multiple IDs)
    if (params.id.includes(',')) {
      console.log('Multiple IDs detected, redirecting to multiple API');
      const uploadIds = params.id.split(',').map(id => id.trim());
      
      let allFlashcards: any[] = [];
      for (const uploadId of uploadIds) {
        const flashcards = await airtableService.getFlashcards(uploadId);
        allFlashcards = [...allFlashcards, ...flashcards];
      }
      
      return NextResponse.json({ flashcards: allFlashcards });
    } else {
      // Single ID, normal behavior
      const flashcards = await airtableService.getFlashcards(params.id);
      return NextResponse.json({ flashcards });
    }
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}
