import './globals.css';
import type { Metadata } from 'next';
import HydrationProvider from '@/components/HydrationProvider';

export const metadata: Metadata = {
  title: 'ESL Speak - AI-Powered English Conversation Practice',
  description: 'Practice English conversation with AI tutor, get pronunciation feedback, and improve your speaking skills with scenario-based learning.',
  keywords: ['ESL', 'English learning', 'conversation practice', 'AI tutor', 'speaking practice'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-900">
        <HydrationProvider>
          {children}
        </HydrationProvider>
      </body>
    </html>
  );
}