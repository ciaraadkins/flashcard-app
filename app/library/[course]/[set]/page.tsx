'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Upload } from '@/types';
import { BookOpenIcon, CalendarIcon, PhotoIcon, ChevronLeftIcon, CheckCircleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SetPage() {
  const params = useParams();
  const router = useRouter();
  const course = decodeURIComponent(params.course as string);
  const set = decodeURIComponent(params.set as string);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(set);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        console.log('Fetching uploads for course:', course, 'set:', set);
        const response = await fetch(`/api/uploads-by-group?course=${encodeURIComponent(course)}&group=${encodeURIComponent(set)}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error('Failed to fetch uploads');
        }
        
        const data = await response.json();
        console.log('Uploads data:', data);
        setUploads(data.uploads);
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to load flashcard sets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUploads();
  }, [course, set]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(set);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/groups/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, oldName: set, newName: editValue }),
      });
      
      if (!response.ok) throw new Error('Failed to rename set');
      
      // Redirect to the updated URL
      router.replace(`/library/${encodeURIComponent(course)}/${encodeURIComponent(editValue)}`);
    } catch (err) {
      setError('Failed to update set name');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(set);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleUploadSelection = (uploadId: string) => {
    setSelectedUploads(prev => 
      prev.includes(uploadId)
        ? prev.filter(id => id !== uploadId)
        : [...prev, uploadId]
    );
  };

  const handleReviewSelected = () => {
    if (selectedUploads.length > 0) {
      const uploadIdsParam = selectedUploads.join(',');
      // Add a small delay to ensure URL is properly parsed
      setTimeout(() => {
        router.push(`/review/${uploadIdsParam}`);
      }, 0);
    }
  };

  const handleSelectAll = () => {
    if (selectedUploads.length === uploads.length) {
      setSelectedUploads([]);
    } else {
      setSelectedUploads(uploads.map(upload => upload.id));
    }
  };

  const FlashcardContent = ({ upload }: { upload: Upload }) => (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {upload.summary}
      </h3>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          {formatDate(upload.date)}
        </div>
        <div className="flex items-center gap-1">
          <PhotoIcon className="w-4 h-4" />
          {upload.imageCount} card{upload.imageCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-screen-sm mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg h-24 shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
          <Link href={`/library/${encodeURIComponent(course)}`} className="text-gray-400 hover:text-gray-600">
          <ChevronLeftIcon className="w-6 h-6" />
          </Link>
          <div className="flex-1">
          <div className="flex items-center gap-2">
            {isEditing ? (
                <>
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-3xl font-bold bg-gray-50 px-3 py-1 rounded border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSave}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                      >
                        <CheckIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900">{set}</h1>
                      <button
                        onClick={handleEdit}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                      >
                        <PencilIcon className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">{course}</p>
              </div>
            </div>
          <Link href={`/upload?course=${encodeURIComponent(course)}&group=${encodeURIComponent(set)}`} className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full justify-center">
            + New Flashcards
          </Link>
        </div>
        
        {uploads.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            <button
              onClick={() => setIsSelectMode(!isSelectMode)}
              className="px-4 py-2.5 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors font-medium w-full"
            >
              {isSelectMode ? 'Cancel' : 'Select'}
            </button>
            {isSelectMode && selectedUploads.length > 0 && (
              <button
                onClick={handleReviewSelected}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium w-full"
              >
                Review {selectedUploads.length} set{selectedUploads.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Upload List */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {uploads.length === 0 && !error ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No flashcards yet in {set}
            </h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first flashcards
            </p>
            <Link href={`/upload?course=${encodeURIComponent(course)}&group=${encodeURIComponent(set)}`} className="btn-primary inline-block">
              Create First Flashcards
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {isSelectMode && (
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {selectedUploads.length === uploads.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className={`card hover:shadow-md transition-shadow ${isSelectMode ? 'cursor-pointer' : ''} ${selectedUploads.includes(upload.id) ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => isSelectMode && toggleUploadSelection(upload.id)}
              >
                <div className="flex items-start">
                  {isSelectMode && (
                    <div className="mr-4 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedUploads.includes(upload.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  {!isSelectMode ? (
                    <Link href={`/review/${upload.id}`} className="flex-1">
                      <FlashcardContent upload={upload} />
                    </Link>
                  ) : (
                    <div className="flex-1">
                      <FlashcardContent upload={upload} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
