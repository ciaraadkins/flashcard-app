import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');

    // Handle empty course parameter or invalid course
    if (!course) {
      console.log('No course parameter provided');
      return NextResponse.json({ groups: [] });
    }

    console.log('Fetching groups for course:', course);
    const flashcards = await airtableService.getFlashcards();
    console.log('Retrieved flashcards:', flashcards.length, 'cards');
    
    // Early return if no flashcards exist
    if (!flashcards || flashcards.length === 0) {
      console.log('No flashcards found');
      return NextResponse.json({ groups: [] });
    }
    
    // Filter flashcards by course and extract unique groups
    const groups = Array.from(
      new Set(
        flashcards
          .filter(card => card.course === course)
          .map(card => card.group)
          .filter(group => group && group !== '')
      )
    );

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
