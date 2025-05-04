import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const flashcards = await airtableService.getFlashcards(params.id);
    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}
