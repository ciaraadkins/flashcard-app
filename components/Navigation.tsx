'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  PhotoIcon, 
  BookOpenIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  PhotoIcon as PhotoIconSolid, 
  BookOpenIcon as BookOpenIconSolid, 
  UserCircleIcon as UserCircleIconSolid 
} from '@heroicons/react/24/solid';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon, activeIcon: HomeIconSolid },
  { href: '/upload', label: 'Upload', icon: PhotoIcon, activeIcon: PhotoIconSolid },
  { href: '/library', label: 'Library', icon: BookOpenIcon, activeIcon: BookOpenIconSolid },
  { href: '/profile', label: 'Profile', icon: UserCircleIcon, activeIcon: UserCircleIconSolid },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-screen-sm mx-auto">
        <ul className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
