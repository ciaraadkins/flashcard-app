import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { airtableService } from '@/lib/airtable';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');
    const group = searchParams.get('group');

    if (!course || !group) {
      return NextResponse.json(
        { error: 'Course and group parameters are required' },
        { status: 400 }
      );
    }

    // Get all flashcards for the course and group
    const flashcards = await airtableService.getFlashcards();
    console.log('All flashcards:', flashcards.length);
    
    const filteredFlashcards = flashcards.filter(
      card => card.course === course && card.group === group
    );
    console.log('Filtered flashcards:', filteredFlashcards.length);
    console.log('Filtered flashcards sample:', filteredFlashcards[0]);

    // Get unique uploadIds from flashcards
    const uploadIds = [...new Set(filteredFlashcards.map(card => card.uploadId))].filter(Boolean);
    console.log('UploadIds:', uploadIds);

    // Get uploads for these uploadIds
    const allUploads = await airtableService.getUploads();
    console.log('All uploads:', allUploads.map(u => ({ id: u.id, course: u.course, summary: u.summary })));
    
    const uploads = allUploads.filter(upload => uploadIds.includes(upload.id));
    console.log('Filtered uploads:', uploads);

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}
