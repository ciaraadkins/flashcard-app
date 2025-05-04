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

    const uploads = await airtableService.getUploads();
    
    // Filter uploads if course or group is specified
    let filteredUploads = uploads;
    
    if (course) {
      filteredUploads = filteredUploads.filter(upload => upload.course === course);
    }
    
    // For now, we don't have group filtering in the Upload type/Airtable
    // We'll need to add group field later if needed
    
    return NextResponse.json({ uploads: filteredUploads });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}
