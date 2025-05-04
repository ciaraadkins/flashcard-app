const Airtable = require('airtable');

// Directly from your .env.local
const AIRTABLE_API_KEY = 'patGtdaJtmXrgeM7U.e058061e8f5e58521af7f4b0c23bbbe440993bbd40f4706ab723f3c6bc793959';
const AIRTABLE_BASE_ID = 'appSZVLe3hjQ8MCD8';

// Configure Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

const base = Airtable.base(AIRTABLE_BASE_ID);

async function fixDemoData() {
  try {
    console.log('Step 1: Finding incorrect French Culture flashcards...');
    const records = await base('Flashcards').select({
      filterByFormula: "course = 'French Culture'"
    }).all();
    
    console.log(`Found ${records.length} French Culture flashcards`);
    
    // Delete the incorrect records
    if (records.length > 0) {
      console.log('Step 2: Deleting incorrect flashcards...');
      const recordIds = records.map(record => record.id);
      
      // Delete in batches of 10 (Airtable limit)
      for (let i = 0; i < recordIds.length; i += 10) {
        const batch = recordIds.slice(i, i + 10);
        await base('Flashcards').destroy(batch);
        console.log(`Deleted ${batch.length} records`);
      }
    }
    
    console.log('Step 3: Creating correct French Culture flashcards...');
    
    // Create an upload record first
    const uploadRecord = await base('Uploads').create({
      uploadId: 'demo_french_culture',
      date: new Date().toISOString(),
      summary: 'French Culture Demo Set',
      course: 'French Culture',
      imageCount: 0
    });
    
    console.log('Created upload record:', uploadRecord.id);
    
    // Create flashcards with the correct uploadId
    const flashcards = [
      {
        fields: {
          front: "What is the capital of France?",
          back: "Paris",
          course: "French Culture",
          group: "Geography",
          uploadId: "demo_french_culture"
        }
      },
      {
        fields: {
          front: "Name a famous French landmark",
          back: "Eiffel Tower (Tour Eiffel)",
          course: "French Culture",
          group: "Geography",
          uploadId: "demo_french_culture"
        }
      },
      {
        fields: {
          front: "What is the French word for 'hello'?",
          back: "Bonjour",
          course: "French Culture",
          group: "Vocabulary",
          uploadId: "demo_french_culture"
        }
      },
      {
        fields: {
          front: "How do you say 'thank you' in French?",
          back: "Merci",
          course: "French Culture",
          group: "Vocabulary",
          uploadId: "demo_french_culture"
        }
      }
    ];

    const newRecords = await base('Flashcards').create(flashcards);
    console.log(`Successfully created ${newRecords.length} flashcards with correct uploadId`);
    
    // Verify the data
    console.log('\nStep 4: Verifying data...');
    const allRecords = await base('Flashcards').select({}).all();
    console.log('Total flashcards:', allRecords.length);
    
    const courses = [...new Set(allRecords.map(r => r.fields.course).filter(Boolean))];
    console.log('All courses:', courses);
    
    const frenchRecords = await base('Flashcards').select({
      filterByFormula: "course = 'French Culture'"
    }).all();
    
    console.log('\nFrench Culture details:');
    frenchRecords.forEach(record => {
      console.log(`- ${record.fields.front} (group: ${record.fields.group}, uploadId: ${record.fields.uploadId})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixDemoData();
