import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function POST(request: Request) {
  try {
    const { course, oldName, newName } = await request.json();

    // Configure and create Airtable instance
    Airtable.configure({
      apiKey: process.env.AIRTABLE_API_KEY,
    });
    const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);
    const table = base(process.env.AIRTABLE_TABLE_1_NAME!); // Use Flashcards table
    
    // Find all records with the old group name in the specified course
    const records = await table.select({
      filterByFormula: `AND({course} = "${course}", {group} = "${oldName}")`,
    }).all();

    if (records.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Update all records to new group name
    const updates = records.map(record => ({
      id: record.id,
      fields: {
        group: newName,
      },
    }));

    await table.update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to rename group:', error);
    return NextResponse.json(
      { error: 'Failed to rename group' },
      { status: 500 }
    );
  }
}
