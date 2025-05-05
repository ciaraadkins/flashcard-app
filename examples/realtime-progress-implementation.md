# Realtime Progress Implementation

This document shows how to implement real-time progress tracking for flashcard generation using Server-Sent Events (SSE).

## Overview

1. **Server-Sent Events (SSE)**: A simple, one-way communication from server to client
2. **Progress Polling**: Alternative approach using regular fetch requests
3. **WebSocket**: More complex but full-duplex communication (optional)

## 1. Server-Sent Events Implementation

### Server Route (`/api/process-with-progress/route.ts`)

```typescript
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData();
  const images = [];
  
  // Create a new TransformStream for Server-Sent Events
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Function to send progress update
  const sendProgress = (step: string, percentage: number) => {
    const data = JSON.stringify({ step, percentage });
    writer.write(encoder.encode(`data: ${data}\n\n`));
  };

  // Start processing in the background
  (async () => {
    try {
      sendProgress('uploading', 0);

      // Extract images
      for (let i = 0; i < 10; i++) {
        const image = formData.get(`image${i}`) as File | null;
        if (image) images.push(image);
      }

      sendProgress('analyzing-chunks', 20);
      
      // Process with OpenAI
      const ocrService = createOCRService();
      const extractedTexts: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const buffer = await image.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const imageData = `data:${image.type};base64,${base64Image}`;
        
        const text = await ocrService.extractText(imageData);
        extractedTexts.push(text);
        
        // Update progress based on OCR completion
        const ocrProgress = 20 + (i + 1) * (40 / images.length);
        sendProgress('analyzing-chunks', Math.min(ocrProgress, 60));
      }

      sendProgress('analyzing-batch1', 65);
      
      // Generate flashcards with chunking
      const flashcardGenerator = createFlashcardGenerator();
      const combinedText = extractedTexts.join('\n\n---\n\n');
      
      // Simulate chunked processing
      const chunks = splitIntoChunks(combinedText);
      let allCards: any[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const cards = await flashcardGenerator.generateFlashcards({
          extractedText: chunks[i],
          prompt: formData.get('prompt') as string || undefined,
        });
        
        allCards = [...allCards, ...cards];
        
        // Update progress
        const chunkProgress = 65 + (i + 1) * (15 / chunks.length);
        if (i < chunks.length / 2) {
          sendProgress('analyzing-batch1', Math.min(chunkProgress, 75));
        } else {
          sendProgress('analyzing-batch2', Math.min(chunkProgress, 85));
        }
      }

      sendProgress('finalizing-analysis', 90);

      // Save to Airtable
      const upload = await airtableService.createUpload({
        date: new Date().toISOString(),
        summary: generateUploadTitle(allCards, formData.get('course') as string, formData.get('group') as string),
        course: formData.get('course') as string || undefined,
        imageCount: images.length,
      });

      const savedCards = await airtableService.createFlashcards(
        allCards.map(card => ({
          ...card,
          uploadId: upload.id,
          course: formData.get('course') as string || undefined,
          group: formData.get('group') as string || undefined,
        }))
      );

      sendProgress('complete', 100);
      
      // Send final result
      const data = JSON.stringify({ 
        uploadId: upload.id, 
        flashcards: savedCards 
      });
      writer.write(encoder.encode(`data: ${data}\n\n`));
      writer.close();
      
    } catch (error) {
      console.error('Error:', error);
      const data = JSON.stringify({ error: 'Failed to process images' });
      writer.write(encoder.encode(`data: ${data}\n\n`));
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper function to split text into manageable chunks
function splitIntoChunks(text: string, maxChunkSize: number = 3000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  const sentences = text.split('. ');
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + '. ';
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
```

### Client-side Implementation

```typescript
const handleSubmit = async () => {
  setIsProcessing(true);
  setError(null);
  setProgressStep('uploading');
  setProgressPercentage(0);

  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(`image${index}`, image);
  });
  formData.append('prompt', prompt);
  formData.append('course', course);
  formData.append('group', group);

  try {
    const response = await fetch('/api/process-with-progress', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process images');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(5));
            
            if (data.step && data.percentage) {
              setProgressStep(data.step as ProgressStep);
              setProgressPercentage(data.percentage);
            } else if (data.uploadId) {
              // Processing complete
              setTimeout(() => {
                router.push(`/review/${data.uploadId}`);
              }, 800);
            } else if (data.error) {
              throw new Error(data.error);
            }
          }
        }
      }
    }
  } catch (err) {
    setError('Failed to process images. Please try again.');
    console.error(err);
    setProgressStep(null);
    setProgressPercentage(0);
  } finally {
    setIsProcessing(false);
  }
};
```

## 2. Alternative: Progress Polling

If SSE is not suitable, you can implement progress polling:

### Server Route (`/api/job-status/[jobId]/route.ts`)

```typescript
// In-memory job store (use Redis in production)
const jobStore = new Map<string, JobStatus>();

interface JobStatus {
  step: string;
  percentage: number;
  status: 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const jobStatus = jobStore.get(params.jobId);
  
  if (!jobStatus) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  
  return NextResponse.json(jobStatus);
}
```

### Client-side Polling

```typescript
const pollJobStatus = async (jobId: string) => {
  let polling = true;
  
  while (polling) {
    try {
      const response = await fetch(`/api/job-status/${jobId}`);
      const data = await response.json();
      
      setProgressStep(data.step as ProgressStep);
      setProgressPercentage(data.percentage);
      
      if (data.status === 'completed') {
        polling = false;
        router.push(`/review/${data.result.uploadId}`);
      } else if (data.status === 'error') {
        polling = false;
        throw new Error(data.error);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      polling = false;
      setError('Failed to get job status');
    }
  }
};
```

## 3. Implementation Notes

- **SSE (Server-Sent Events)** is simpler and lighter-weight than WebSocket
- It's unidirectional (server to client only), which is perfect for progress updates
- Works well with HTTP/2 and is automatically reconnected
- Fallback to polling if SSE is not supported by the browser

## 4. Future Enhancements

- Add estimated time remaining calculation
- Implement progress persistence in Redis or database
- Add retry logic for failed operations
- Show more detailed breakdowns (e.g., individual card generation progress)
- Add cancellation support
