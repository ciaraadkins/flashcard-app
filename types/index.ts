export interface Flashcard {
  id: string;
  front: string;
  back: string;
  course?: string;
  group?: string;
  uploadId?: string;
  createdAt?: string;
}

export interface Upload {
  id: string;
  date: string;
  summary: string;
  bookPage?: string;
  course?: string;
  imageCount: number;
}

export interface AirtableCard {
  id: string;
  fields: {
    front: string;
    back: string;
    course?: string;
    group?: string;
    uploadId?: string;
  };
}

export interface AirtableUpload {
  id: string;
  fields: {
    date: string;
    summary: string;
    bookPage?: string;
    course?: string;
    imageCount: number;
  };
}
