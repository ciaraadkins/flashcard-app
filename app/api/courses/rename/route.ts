import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function POST(request: Request) {
  try {
    const { oldName, newName } = await request.json();

    // Configure and create Airtable instance
    Airtable.configure({
      apiKey: process.env.AIRTABLE_API_KEY,
    });
    const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);
    const table = base(process.env.AIRTABLE_TABLE_1_NAME!); // Use Flashcards table
    
    // Find all records with the old course name
    const records = await table.select({
      filterByFormula: `{course} = "${oldName}"`,
    }).all();

    if (records.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Update all records to new course name
    const updates = records.map(record => ({
      id: record.id,
      fields: {
        course: newName,
      },
    }));

    await table.update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to rename course:', error);
    return NextResponse.json(
      { error: 'Failed to rename course' },
      { status: 500 }
    );
  }
}
