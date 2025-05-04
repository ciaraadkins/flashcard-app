const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function checkFlashcards() {
  try {
    console.log('Checking Flashcards table...');
    const records = await base('Flashcards').select({}).all();
    
    console.log('\nFlashcards found:', records.length);
    if (records.length > 0) {
      console.log('\nFirst flashcard:', records[0].fields);
      
      // Get unique courses
      const courses = [...new Set(records.map(r => r.fields.course).filter(Boolean))];
      console.log('\nUnique courses:', courses);
    } else {
      console.log('\nNo flashcards found in the table!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFlashcards();
