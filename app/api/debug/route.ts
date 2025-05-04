import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export async function GET() {
  try {
    console.log('DEBUG: Starting debug endpoint');
    
    // Get all flashcards
    const flashcards = await airtableService.getFlashcards();
    console.log('DEBUG: All flashcards:', flashcards);
    
    // Get unique courses from flashcards
    const courses = Array.from(
      new Set(
        flashcards
          .map(card => card.course)
          .filter(course => course && course !== '')
      )
    );
    console.log('DEBUG: Unique courses:', courses);
    
    return NextResponse.json({
      flashcards,
      courses,
      debug: {
        flashcardCount: flashcards.length,
        courseCount: courses.length,
        sampleFlashcards: flashcards.slice(0, 3),
      }
    });
  } catch (error) {
    console.error('DEBUG: Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to debug', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
