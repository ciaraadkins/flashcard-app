'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpenIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function CoursePage() {
  const params = useParams();
  const course = decodeURIComponent(params.course as string);
  const [sets, setSets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch(`/api/groups?course=${encodeURIComponent(course)}`);
        if (!response.ok) throw new Error('Failed to fetch sets');
        const data = await response.json();
        setSets(data.groups); // keeping 'groups' in API response, just renaming in UI
      } catch (err) {
        setError('Failed to load sets');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSets();
  }, [course]);

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
            <Link href="/library" className="text-gray-400 hover:text-gray-600">
              <ChevronLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{course}</h1>
          </div>
          <Link href="/upload" className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full justify-center">
            + New Set
          </Link>
        </div>

        {/* Set List */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {sets.length === 0 && !error ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sets yet in {course}
            </h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first set
            </p>
            <Link href="/upload" className="btn-primary inline-block">
              Create First Set
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sets.map((set, index) => (
              <Link
                key={index}
                href={`/library/${encodeURIComponent(course)}/${encodeURIComponent(set)}`}
                className="block"
              >
                <div className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <BookOpenIcon className="w-6 h-6 text-indigo-600" />
                      <span className="text-lg font-semibold text-gray-900">{set}</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
