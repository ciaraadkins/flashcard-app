const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function addDemoData() {
  try {
    // Create flashcards for French Culture course
    const flashcards = [
      {
        fields: {
          front: "What is the capital of France?",
          back: "Paris",
          course: "French Culture",
          group: "Geography"
        }
      },
      {
        fields: {
          front: "What is the population of France?",
          back: "Approximately 67 million people",
          course: "French Culture",
          group: "Geography"
        }
      },
      {
        fields: {
          front: "What is 'bonjour' in English?",
          back: "Hello or Good day",
          course: "French Culture",
          group: "Vocabulary"
        }
      },
      {
        fields: {
          front: "What is 'merci' in English?",
          back: "Thank you",
          course: "French Culture",
          group: "Vocabulary"
        }
      }
    ];

    console.log('Adding flashcards...');
    const records = await base('Flashcards').create(flashcards);
    console.log('Successfully added', records.length, 'flashcards');
    
    // Verify the data was added
    console.log('\nVerifying data...');
    const allRecords = await base('Flashcards').select({}).all();
    console.log('Total flashcards in database:', allRecords.length);
    
    const courses = [...new Set(allRecords.map(r => r.fields.course).filter(Boolean))];
    console.log('Courses found:', courses);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addDemoData();
