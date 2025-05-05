require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

async function debugAirtableData() {
  console.log('Environment variables:');
  console.log('AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? '✓ Present' : '✗ Missing');
  console.log('AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID);
  console.log('AIRTABLE_TABLE_1_NAME:', process.env.AIRTABLE_TABLE_1_NAME);
  console.log('AIRTABLE_TABLE_2_NAME:', process.env.AIRTABLE_TABLE_2_NAME);
  console.log('\n-------------------\n');

  try {
    Airtable.configure({
      apiKey: process.env.AIRTABLE_API_KEY,
    });
    
    const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
    
    // Check flashcards
    console.log('Checking Flashcards table...');
    const flashcards = await base(process.env.AIRTABLE_TABLE_1_NAME || 'Flashcards')
      .select({ maxRecords: 5 })
      .all();
    
    console.log('Flashcards found:', flashcards.length);
    if (flashcards.length > 0) {
      console.log('Sample flashcard:', {
        id: flashcards[0].id,
        front: flashcards[0].fields.front,
        back: flashcards[0].fields.back,
        course: flashcards[0].fields.course,
        group: flashcards[0].fields.group,
        uploadId: flashcards[0].fields.uploadId
      });
    }
    
    // Check uploads
    console.log('\nChecking Uploads table...');
    const uploads = await base(process.env.AIRTABLE_TABLE_2_NAME || 'Uploads')
      .select({ maxRecords: 5 })
      .all();
    
    console.log('Uploads found:', uploads.length);
    if (uploads.length > 0) {
      console.log('Sample upload:', {
        id: uploads[0].id,
        date: uploads[0].fields.date,
        summary: uploads[0].fields.summary,
        course: uploads[0].fields.course,
        imageCount: uploads[0].fields.imageCount
      });
    }
    
    // Check specific course and group
    console.log('\nChecking specific course/group...');
    const testCourse = 'French';
    const testGroup = 'Study Sets - May 4, 2025';
    
    const courseFlashcards = await base(process.env.AIRTABLE_TABLE_1_NAME || 'Flashcards')
      .select({
        filterByFormula: `AND({course} = "${testCourse}", {group} = "${testGroup}")`
      })
      .all();
    
    console.log(`Flashcards for ${testCourse} / ${testGroup}:`, courseFlashcards.length);
    if (courseFlashcards.length > 0) {
      const uploadIds = [...new Set(courseFlashcards.map(card => card.fields.uploadId))];
      console.log('Unique uploadIds:', uploadIds);
    }
    
  } catch (error) {
    console.error('Error accessing Airtable:', error);
  }
}

debugAirtableData().catch(console.error);
