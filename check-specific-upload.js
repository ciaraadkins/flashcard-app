const Airtable = require('airtable');

// Configure Airtable
Airtable.configure({
  apiKey: 'patGtdaJtmXrgeM7U.e058061e8f5e58521af7f4b0c23bbbe440993bbd40f4706ab723f3c6bc793959',
});

const base = Airtable.base('appSZVLe3hjQ8MCD8');

async function checkSpecificUpload() {
  try {
    const targetUploadId = 'recyiXp3PD0YnVyYn';
    
    // Get all uploads
    const uploads = await base('Uploads').select({}).all();
    console.log('\nAll uploads:');
    uploads.forEach(upload => {
      console.log(`Record ID: ${upload.id}`);
      console.log(`UploadId field: ${upload.fields.uploadId}`);
      console.log(`Summary: ${upload.fields.summary}`);
      console.log(`Course: ${upload.fields.course}`);
      console.log('---');
    });
    
    // Check if any upload has the uploadId we're looking for
    const targetUpload = uploads.find(u => u.id === targetUploadId || u.fields.uploadId === targetUploadId);
    
    if (targetUpload) {
      console.log('\nFound the target upload:');
      console.log(targetUpload.fields);
    } else {
      console.log('\nNo upload found with uploadId:', targetUploadId);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSpecificUpload();
