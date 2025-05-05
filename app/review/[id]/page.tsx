'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Flashcard } from '@/types';
import FlashcardViewer from '@/components/FlashcardViewer';
import LoadingScreen from '@/components/LoadingScreen';
import { ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';

export default function Review() {
  const params = useParams();
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Force string conversion and split for multiple IDs
  const paramId = params.id as string | string[];
  const idString = Array.isArray(paramId) ? paramId[0] : paramId;
  const uploadIds = idString.split(',').map(id => id.trim());

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        let allFlashcards: Flashcard[] = [];
        
        console.log('Raw params.id:', params.id);
        console.log('uploadIds:', uploadIds);
        console.log('uploadIds length:', uploadIds.length);
        
        // Use single API for all cases (it now handles multiple IDs internally)
        const response = await fetch(`/api/flashcards/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch flashcards');
        const data = await response.json();
        allFlashcards = data.flashcards;
        
        setFlashcards(allFlashcards);
      } catch (err) {
        setError('Failed to load flashcards');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [params.id]);

  const handleSave = async () => {
    try {
      // Implement save functionality here
      alert('Flashcards saved to library!');
      router.push('/library');
    } catch (err) {
      alert('Failed to save flashcards');
    }
  };

  const handleEdit = (card: Flashcard) => {
    // Implement edit functionality here
    alert('Edit functionality coming soon!');
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your flashcards..." />;
  }

  if (error || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {error || 'No flashcards found'}
        </h2>
        <button
          onClick={() => router.push('/upload')}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Study Mode</h1>
          <button className="text-gray-600 hover:text-gray-900">
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Flashcard Viewer */}
        <FlashcardViewer
          flashcards={flashcards}
          onEdit={handleEdit}
          onSave={handleSave}
        />

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            className="btn-primary w-full"
          >
            Save to Library
          </button>
        </div>
      </div>
    </div>
  );
}
