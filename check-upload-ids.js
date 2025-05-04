const Airtable = require('airtable');

// Configure Airtable
Airtable.configure({
  apiKey: 'patGtdaJtmXrgeM7U.e058061e8f5e58521af7f4b0c23bbbe440993bbd40f4706ab723f3c6bc793959',
});

const base = Airtable.base('appSZVLe3hjQ8MCD8');

async function checkUploadIds() {
  try {
    // Get all uploads
    const uploads = await base('Uploads').select({}).all();
    console.log('\nUploads:');
    uploads.forEach(upload => {
      console.log(`ID: ${upload.id}`);
      console.log(`UploadId field: ${upload.fields.uploadId}`);
      console.log(`Course: ${upload.fields.course}`);
      console.log(`Summary: ${upload.fields.summary}`);
      console.log('---');
    });
    
    // Get flashcards for Luz group
    const flashcards = await base('Flashcards').select({
      filterByFormula: "group = 'Luz'"
    }).all();
    
    console.log('\nFlashcards in Luz group:');
    flashcards.forEach(card => {
      console.log(`Front: ${card.fields.front}`);
      console.log(`Course: ${card.fields.course}`);
      console.log(`Group: ${card.fields.group}`);
      console.log(`UploadId: ${card.fields.uploadId}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUploadIds();
