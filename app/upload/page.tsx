'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Upload() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [images, setImages] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [course, setCourse] = useState(searchParams.get('course') || '');
  const [group, setGroup] = useState(searchParams.get('group') || '');
  const [existingCourses, setExistingCourses] = useState<string[]>([]);
  const [existingGroups, setExistingGroups] = useState<string[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCustomCourse, setIsCustomCourse] = useState(searchParams.get('newCourse') === 'true' || !searchParams.get('course'));
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  // Fetch existing courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('Fetching courses...');
        const response = await fetch('/api/courses');
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Courses data:', data);
          setExistingCourses(data.courses);
        } else {
          console.error('Failed to fetch courses:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch groups when course changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (course && course !== 'custom') {
        try {
          const response = await fetch(`/api/groups?course=${encodeURIComponent(course)}`);
          if (response.ok) {
            const data = await response.json();
            setExistingGroups(data.groups);
          }
        } catch (error) {
          console.error('Failed to fetch groups:', error);
        }
      } else {
        setExistingGroups([]);
      }
      setGroup(''); // Reset group when course changes
      setIsCustomGroup(false);
    };
    fetchGroups();
  }, [course]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    setImages([...images, ...files]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });
      formData.append('prompt', prompt);
      formData.append('course', course);
      formData.append('group', group);

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process images');
      }

      const data = await response.json();
      router.push(`/review/${data.uploadId}`);
    } catch (err) {
      setError('Failed to process images. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Images</h1>

        {/* Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images ({images.length}/10)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={images.length >= 10}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer ${images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Drag and drop your images or click to browse
              </p>
            </label>
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover w-full h-24"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus Prompt (Optional)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What concepts should we focus on? e.g., 'Focus on definitions and examples'"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        {/* Course Dropdown/Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course (Optional)
          </label>
          {isLoadingCourses ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              Loading courses...
            </div>
          ) : !isCustomCourse ? (
            <div className="space-y-2">
              <select
                value={course}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomCourse(true);
                    setCourse('');
                  } else {
                    setCourse(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a course</option>
                {existingCourses.map((existingCourse, index) => (
                  <option key={index} value={existingCourse}>
                    {existingCourse}
                  </option>
                ))}
                <option value="custom">+ Add new course</option>
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Enter course name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  setIsCustomCourse(false);
                  setCourse('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Choose from existing courses
              </button>
            </div>
          )}
        </div>

        {/* Group Dropdown/Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set (Optional)
          </label>
          {!isCustomGroup ? (
            <div className="space-y-2">
              <select
                value={group}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomGroup(true);
                    setGroup('');
                  } else {
                    setGroup(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!course || isCustomCourse}
              >
                <option value="">Select a set</option>
                {existingGroups.map((existingGroup, index) => (
                  <option key={index} value={existingGroup}>
                    {existingGroup}
                  </option>
                ))}
                <option value="custom">+ Add new set</option>
              </select>
              {!course && !isCustomCourse && (
                <p className="text-sm text-gray-500">Select a course first to see sets</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Enter set name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  setIsCustomGroup(false);
                  setGroup('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Choose from existing sets
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isProcessing || images.length === 0}
          className="btn-primary w-full"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Create Flashcards'
          )}
        </button>
      </div>
    </div>
  );
}
