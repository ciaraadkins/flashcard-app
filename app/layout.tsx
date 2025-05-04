import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudyCard - Turn Images into Flashcards',
  description: 'Convert your study materials into smart flashcards with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 pb-16">
            {children}
          </main>
          <Navigation />
        </div>
      </body>
    </html>
  )
}
