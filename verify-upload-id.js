const Airtable = require('airtable');

// Configure Airtable
Airtable.configure({
  apiKey: 'patGtdaJtmXrgeM7U.e058061e8f5e58521af7f4b0c23bbbe440993bbd40f4706ab723f3c6bc793959',
});

const base = Airtable.base('appSZVLe3hjQ8MCD8');

async function verifyUploadId() {
  try {
    const targetId = 'recyiXp3PD0YnVyYn';
    
    console.log('\nLooking for upload with ID:', targetId);
    
    // Try to get the specific record by ID
    try {
      const record = await base('Uploads').find(targetId);
      console.log('\nFound upload record by ID:');
      console.log('Record ID:', record.id);
      console.log('Fields:', record.fields);
      console.log('Course:', record.fields.course);
      console.log('Summary:', record.fields.summary);
    } catch (err) {
      console.log('\nNo upload record found with ID:', targetId);
      console.log('Error:', err.message);
    }
    
    // Also check all uploads to find any pattern
    const uploads = await base('Uploads').select({}).all();
    console.log(`\nTotal uploads in table: ${uploads.length}`);
    console.log('Recent uploads:');
    uploads.slice(-3).forEach(upload => {
      console.log(`- ID: ${upload.id}`);
      console.log(`  Course: ${upload.fields.course}`);
      console.log(`  Summary: ${upload.fields.summary}`);
      console.log(`  Date: ${upload.fields.date}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyUploadId();
