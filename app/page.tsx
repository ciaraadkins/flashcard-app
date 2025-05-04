import Link from 'next/link';
import { SparklesIcon, CameraIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <SparklesIcon className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StudyCard
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Turn any image into flashcards in seconds
          </p>

          <Link href="/upload" className="btn-primary inline-block mb-8">
            Start Creating
          </Link>
        </div>

        {/* Features */}
        <div className="space-y-6">
          <div className="card flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <CameraIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Take or Upload Photos</h3>
              <p className="text-gray-600">
                Capture your textbook pages, notes, or diagrams
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI-Powered Cards</h3>
              <p className="text-gray-600">
                Smart technology extracts key concepts automatically
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Study Anywhere</h3>
              <p className="text-gray-600">
                Review your cards on-the-go from any device
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <Link href="/library" className="text-indigo-600 hover:text-indigo-500">
            View all study sets →
          </Link>
        </div>
      </div>
    </div>
  );
}
