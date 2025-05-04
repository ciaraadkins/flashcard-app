'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Processing your images...' }: LoadingScreenProps) {
  const tips = [
    'For better results, ensure your images have good lighting',
    'Avoid shadows and glare when taking photos',
    'Text should be clearly visible and not blurry',
    'Use higher quality images for better accuracy',
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <SparklesIcon className="w-16 h-16 text-indigo-600 mx-auto animate-pulse" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {message}
        </h2>
        
        <div className="w-12 h-12 mx-auto mb-8">
          <div className="w-full h-full border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-6 max-w-sm mx-auto">
          <p className="text-indigo-800">
            💡 Tip: {randomTip}
          </p>
        </div>
      </div>
    </div>
  );
}
