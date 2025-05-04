const Airtable = require('airtable');

// Configure Airtable
Airtable.configure({
  apiKey: 'patGtdaJtmXrgeM7U.e058061e8f5e58521af7f4b0c23bbbe440993bbd40f4706ab723f3c6bc793959',
});

const base = Airtable.base('appSZVLe3hjQ8MCD8');

async function debugFlashcards() {
  try {
    const records = await base('Flashcards').select({}).all();
    
    console.log('\nAll flashcards:');
    records.forEach(record => {
      console.log(`- Front: "${record.fields.front}"`);
      console.log(`  Course: "${record.fields.course}"`);
      console.log(`  Group: "${record.fields.group}"`);
      console.log(`  UploadId: "${record.fields.uploadId}"`);
      console.log('---');
    });
    
    // Filter for Spanish course
    const spanishCourse = records.filter(r => r.fields.course && r.fields.course.includes('Spanish'));
    console.log('\nSpanish course flashcards:', spanishCourse.length);
    
    // Filter for Luz group
    const luzGroup = records.filter(r => r.fields.group === 'Luz');
    console.log('\nLuz group flashcards:', luzGroup.length);
    
    if (luzGroup.length > 0) {
      console.log('\nLuz group details:');
      luzGroup.forEach(record => {
        console.log(`- Front: "${record.fields.front}"`);
        console.log(`  Course: "${record.fields.course}"`);
        console.log(`  Group: "${record.fields.group}"`);
        console.log(`  UploadId: "${record.fields.uploadId}"`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugFlashcards();
