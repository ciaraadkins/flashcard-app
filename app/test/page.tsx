'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('');
  const [courses, setCourses] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function testAPI() {
      try {
        setStatus('Fetching from /api/courses...');
        console.log('Testing API...');
        
        const response = await fetch('/api/courses');
        console.log('Response:', response);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('Response text:', text);
        
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
        
        setCourses(data.courses || []);
        setStatus('Success!');
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Failed');
      }
    }
    
    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Status:</h2>
          <p>{status}</p>
        </div>
        {error && (
          <div className="bg-red-50 p-4 rounded">
            <h2 className="font-semibold text-red-700">Error:</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        <div>
          <h2 className="font-semibold">Courses:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(courses, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
