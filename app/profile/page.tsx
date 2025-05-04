import Link from 'next/link';
import { UserCircleIcon, InformationCircleIcon, ChatBubbleLeftRightIcon, CogIcon } from '@heroicons/react/24/outline';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

        {/* User Info */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <UserCircleIcon className="w-16 h-16 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Anonymous User</h2>
              <p className="text-gray-600">Free Account</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <Link href="/help" className="card flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <InformationCircleIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Help & FAQ</span>
            </div>
            <span className="text-gray-400">›</span>
          </Link>

          <Link href="/feedback" className="card flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Send Feedback</span>
            </div>
            <span className="text-gray-400">›</span>
          </Link>

          <Link href="/settings" className="card flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <CogIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Settings</span>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          StudyCard v0.1.0
        </div>
      </div>
    </div>
  );
}
