import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export async function GET() {
  try {
    console.log('Fetching flashcards to get courses...');
    const flashcards = await airtableService.getFlashcards();
    console.log('Flashcards count:', flashcards.length);
    
    // Extract unique courses from flashcards
    const courses = Array.from(
      new Set(
        flashcards
          .map(card => card.course)
          .filter(course => course && course !== '')
      )
    );
    
    console.log('Extracted courses:', courses);
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
