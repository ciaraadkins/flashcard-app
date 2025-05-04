'use client';

import { useState } from 'react';
import { Flashcard } from '@/types';
import { PencilIcon, BookmarkIcon } from '@heroicons/react/24/outline';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onEdit?: (card: Flashcard) => void;
  onSave?: () => void;
}

export default function FlashcardViewer({ flashcards, onEdit, onSave }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!currentCard) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        {currentCard.course && (
          <div className="text-sm text-indigo-600">
            {currentCard.course}
          </div>
        )}
      </div>

      {/* Flashcard */}
      <div 
        className="flashcard cursor-pointer perspective-1000" 
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-full rounded-lg shadow-lg transform transition-transform duration-500 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div 
            className={`absolute w-full h-full rounded-lg bg-white p-6 backface-hidden ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-lg text-gray-900">{currentCard.front}</p>
            </div>
          </div>

          {/* Back */}
          <div 
            className={`absolute w-full h-full rounded-lg bg-indigo-50 p-6 backface-hidden rotate-y-180 ${
              isFlipped ? 'rotate-y-0' : ''
            }`}
          >
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-lg text-gray-900">{currentCard.back}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(currentCard)}
              className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="p-2 text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-100"
            >
              <BookmarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
          disabled={currentIndex === flashcards.length - 1}
        >
          Next →
        </button>
      </div>

      {/* Tap hint */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Tap card to flip
      </p>
    </div>
  );
}
