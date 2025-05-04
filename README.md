# StudyCard - Image to Flashcard App

StudyCard is a mobile-first web application that transforms images into smart, study-ready flashcards using AI.

## Features

- 📸 Upload or capture up to 10 images at a time
- ✍️ Add optional prompts to guide flashcard generation
- ⚡ AI-powered flashcard creation using Mistral
- 💾 Save flashcard sets by topic, course, or book page
- 📱 Mobile-first responsive design
- 🔄 Flip card animation for review

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Airtable
- **OCR/AI**: Mistral API
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Airtable account and API key
- Mistral API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flashcard-app.git
cd flashcard-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:
```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_1_NAME=Flashcards
AIRTABLE_TABLE_2_NAME=Uploads
MISTRAL_API_KEY=your_mistral_api_key
NEXT_PUBLIC_APP_NAME=StudyCard
```

4. Set up Airtable:
   - Create a new base
   - Create "Flashcards" table with fields: front (text), back (text), course (text), group (text), uploadId (text)
   - Create "Uploads" table with fields: date (text), summary (text), bookPage (text), course (text), imageCount (number)

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
flashcard-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── process/       # Image processing endpoint
│   │   ├── flashcards/    # Flashcard CRUD endpoints
│   │   └── uploads/       # Upload listing endpoint
│   ├── upload/            # Upload page
│   ├── review/[id]/       # Review flashcards page
│   ├── library/           # Saved flashcards library
│   └── profile/           # User profile page
├── components/            # React components
│   ├── Navigation.tsx     # Bottom navigation
│   ├── FlashcardViewer.tsx
│   └── LoadingScreen.tsx
├── lib/                   # Utility functions
│   ├── airtable.ts        # Airtable service
│   ├── ocr.ts             # OCR service
│   └── flashcard-generator.ts
└── types/                 # TypeScript types
```

## Usage

1. **Upload Images**: Tap the upload button to select or capture images
2. **Add Context**: Optionally add a prompt to guide flashcard generation
3. **Process**: The app extracts text and creates flashcards automatically
4. **Review**: Flip through generated flashcards
5. **Save**: Save sets to your library for later review

## Development

The app uses a modular architecture making it easy to:
- Switch OCR providers (currently using Mistral)
- Change databases (currently using Airtable)
- Add new features

### Extending the App

To switch OCR providers, implement the `OCRService` interface:

```typescript
interface OCRService {
  extractText(imageData: string): Promise<string>;
}
```

To change databases, modify the `airtableService` in `/lib/airtable.ts`.

## License

MIT
