import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Environment check:');
    console.log('AIRTABLE_API_KEY present:', !!process.env.AIRTABLE_API_KEY);
    console.log('AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID);
    console.log('AIRTABLE_TABLE_1_NAME:', process.env.AIRTABLE_TABLE_1_NAME);
    console.log('AIRTABLE_TABLE_2_NAME:', process.env.AIRTABLE_TABLE_2_NAME);

    // Test getting flashcards
    const flashcards = await airtableService.getFlashcards();
    console.log('Flashcards found:', flashcards.length);
    
    // Test getting uploads
    const uploads = await airtableService.getUploads();
    console.log('Uploads found:', uploads.length);
    
    // Sample recent data
    const recentFlashcards = flashcards.slice(0, 3);
    const recentUploads = uploads.slice(0, 3);
    
    return NextResponse.json({
      env: {
        apiKeyPresent: !!process.env.AIRTABLE_API_KEY,
        baseId: process.env.AIRTABLE_BASE_ID,
        table1Name: process.env.AIRTABLE_TABLE_1_NAME,
        table2Name: process.env.AIRTABLE_TABLE_2_NAME,
      },
      flashcardsCount: flashcards.length,
      uploadsCount: uploads.length,
      recentFlashcards,
      recentUploads,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Error in debug endpoint',
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
