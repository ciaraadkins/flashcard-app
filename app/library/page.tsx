'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpenIcon, ChevronRightIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Library() {
  const [courses, setCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data.courses);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditValue(currentName);
  };

  const handleSave = async (index: number, oldName: string) => {
    try {
      const response = await fetch('/api/courses/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: editValue }),
      });
      
      if (!response.ok) throw new Error('Failed to rename course');
      
      // Update local state
      const updatedCourses = [...courses];
      updatedCourses[index] = editValue;
      setCourses(updatedCourses);
      setEditingIndex(null);
    } catch (err) {
      setError('Failed to update course name');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditValue('');
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Study Library</h1>
          <Link href="/upload" className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full justify-center">
            + New Course
          </Link>
        </div>

        {/* Course List */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {courses.length === 0 && !error ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first course
            </p>
            <Link href="/upload" className="btn-primary inline-block">
              Create First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <BookOpenIcon className="w-6 h-6 text-indigo-600" />
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-lg font-semibold bg-gray-50 px-3 py-1 rounded border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 flex-1"
                        autoFocus
                      />
                    ) : (
                      <Link href={`/library/${encodeURIComponent(course)}`} className="flex-1 text-lg font-semibold text-gray-900">
                        {course}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingIndex === index ? (
                      <>
                        <button
                          onClick={() => handleSave(index, course)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEdit(index, course);
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <Link href={`/library/${encodeURIComponent(course)}`}>
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
