import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');

    if (!course) {
      return NextResponse.json({ groups: [] });
    }

    const flashcards = await airtableService.getFlashcards();
    
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
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}
