import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { airtableService } from '@/lib/airtable';

export const dynamic = 'force-dynamic';
// Removing edge runtime as it doesn't fully support Airtable library
// export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Validate environment variables
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error('Missing Airtable environment variables');
    return NextResponse.json(
      { error: 'Server configuration error', details: 'Missing Airtable credentials' },
      { status: 500 }
    );
  }

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

    // Get unique uploadIds from flashcards - filter out undefined values
    const uploadIds = [...new Set(filteredFlashcards.map(card => card.uploadId))].filter((id): id is string => Boolean(id));
    console.log('UploadIds:', uploadIds);

    // Calculate flashcard count per uploadId
    const flashcardCounts = uploadIds.reduce((acc, uploadId) => {
      acc[uploadId] = filteredFlashcards.filter(card => card.uploadId === uploadId).length;
      return acc;
    }, {} as Record<string, number>);

    // Get uploads for these uploadIds
    const allUploads = await airtableService.getUploads();
    console.log('All uploads:', allUploads.map(u => ({ id: u.id, course: u.course, summary: u.summary })));
    
    const uploads = allUploads
      .filter(upload => uploadIds.includes(upload.id))
      .map(upload => ({
        ...upload,
        flashcardCount: flashcardCounts[upload.id] || 0
      }))
      .sort((a, b) => {
        // First sort by date (newest first)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
        
        // Then by incremental number if present
        const incrementA = a.summary.match(/#(\d+)/)?.[1];
        const incrementB = b.summary.match(/#(\d+)/)?.[1];
        
        if (incrementA && incrementB) {
          return parseInt(incrementA) - parseInt(incrementB);
        }
        
        return 0;
      });
      
    console.log('Filtered uploads with flashcard counts:', uploads);

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
