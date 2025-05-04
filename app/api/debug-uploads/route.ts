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

    console.log('Debug uploads - Course:', course, 'Group:', group);

    // Get all flashcards
    const allFlashcards = await airtableService.getFlashcards();
    console.log('Total flashcards:', allFlashcards.length);

    // Filter by course and group
    const filteredFlashcards = allFlashcards.filter(
      card => card.course === course && card.group === group
    );
    console.log('Filtered flashcards:', filteredFlashcards.length);
    console.log('Flashcards:', filteredFlashcards);

    // Get uploadIds
    const uploadIds = [...new Set(filteredFlashcards.map(card => card.uploadId))].filter(Boolean);
    console.log('UploadIds:', uploadIds);

    // Get all uploads
    const allUploads = await airtableService.getUploads();
    console.log('Total uploads:', allUploads.length);
    
    const uploads = allUploads.filter(upload => uploadIds.includes(upload.id));
    console.log('Filtered uploads:', uploads.length);
    console.log('Uploads:', uploads);

    return NextResponse.json({
      course,
      group,
      allFlashcards: allFlashcards.length,
      filteredFlashcards: filteredFlashcards.length,
      flashcards: filteredFlashcards,
      uploadIds,
      allUploads: allUploads.length,
      uploads
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
