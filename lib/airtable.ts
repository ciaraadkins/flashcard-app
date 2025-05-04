// @ts-nocheck
import Airtable from 'airtable';
import { Flashcard, Upload, AirtableCard, AirtableUpload } from '@/types';

class AirtableService {
  private base: Airtable.Base;
  private table1Name: string;
  private table2Name: string;

  constructor() {
    Airtable.configure({
      apiKey: process.env.AIRTABLE_API_KEY,
    });
    
    this.base = Airtable.base(process.env.AIRTABLE_BASE_ID!);
    this.table1Name = process.env.AIRTABLE_TABLE_1_NAME || 'Flashcards';
    this.table2Name = process.env.AIRTABLE_TABLE_2_NAME || 'Uploads';
  }

  async createFlashcards(cards: Omit<Flashcard, 'id'>[]): Promise<Flashcard[]> {
    // Clean data before sending to Airtable
    const cleanedCards = cards.map(card => {
      const fields: any = {
        front: card.front,
        back: card.back,
      };
      
      // Only add defined fields
      if (card.course !== undefined) fields.course = card.course;
      if (card.group !== undefined) fields.group = card.group;
      if (card.uploadId !== undefined) fields.uploadId = card.uploadId;
      
      // Return wrapped in fields property for multiple record creation
      return { fields };
    });
    
    // Debug logging
    console.log('Creating flashcards with data:', cleanedCards);
    
    try {
      const records = await this.base(this.table1Name).create(cleanedCards);

      return records.map(record => ({
        id: record.id,
        front: record.fields.front as string,
        back: record.fields.back as string,
        course: record.fields.course as string || undefined,
        group: record.fields.group as string || undefined,
        uploadId: record.fields.uploadId as string || undefined,
      }));
    } catch (error) {
      console.error('Error creating flashcards:', error);
      console.error('Data that failed:', cleanedCards);
      throw error;
    }
  }

  async getFlashcards(uploadId?: string): Promise<Flashcard[]> {
    const records = uploadId 
      ? await this.base(this.table1Name)
          .select({ filterByFormula: `{uploadId} = '${uploadId}'` })
          .all()
      : await this.base(this.table1Name)
          .select({})
          .all();

    return records.map(record => ({
      id: record.id,
      front: record.fields.front as string,
      back: record.fields.back as string,
      course: record.fields.course as string,
      group: record.fields.group as string,
      uploadId: record.fields.uploadId as string,
    }));
  }

  async createUpload(upload: Omit<Upload, 'id'>): Promise<Upload> {
    // Clean data before sending to Airtable
    const fields: any = {
      uploadId: `upload_${Date.now()}`, // Generate a unique uploadId
      date: upload.date,
      summary: upload.summary,
      imageCount: upload.imageCount,
    };
    
    // Only add defined fields
    if (upload.bookPage !== undefined) fields.bookPage = upload.bookPage;
    if (upload.course !== undefined) fields.course = upload.course;
    
    console.log('Creating upload with data:', fields);
    
    try {
      // For single record creation, pass fields directly
      const record = await this.base(this.table2Name).create(fields);

      return {
        id: record.id,
        date: record.fields.date as string,
        summary: record.fields.summary as string,
        bookPage: record.fields.bookPage as string || undefined,
        course: record.fields.course as string || undefined,
        imageCount: record.fields.imageCount as number,
      };
    } catch (error) {
      console.error('Error creating upload:', error);
      console.error('Data that failed:', fields);
      throw error;
    }
  }

  async getUploads(): Promise<Upload[]> {
    const records = await this.base(this.table2Name)
      .select({
        sort: [{ field: 'date', direction: 'desc' }],
      })
      .all();

    return records.map(record => ({
      id: record.id, // Always use the Airtable record ID
      date: record.fields.date as string,
      summary: record.fields.summary as string,
      bookPage: record.fields.bookPage as string,
      course: record.fields.course as string,
      imageCount: record.fields.imageCount as number,
    }));
  }
}

export const airtableService = new AirtableService();
