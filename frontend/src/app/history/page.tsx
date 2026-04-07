'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mic, ArrowLeft, Calendar, Clock, ChevronRight, Loader2, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { conversationService } from '@/lib/api';
import { IConversation } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  flagged: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  reviewed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    loadHistory();
  }, [isReady, isAuthenticated]);

  const loadHistory = async () => {
    try {
      const data = await conversationService.list({ limit: 50 });
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Conversation History</span>
            <div className="w-5" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <Mic className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-6">No conversations yet.</p>
            <Link href="/scenarios" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Start your first practice!
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div key={conv._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {(conv.scenario as any)?.title || 'Unknown Scenario'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {(conv.scenario as any)?.titleVietnamese}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATUS_COLORS[conv.status]}`}>
                      {conv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(conv.startedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {conv.messages.filter((m: any) => m.role === 'user').length} messages
                    </span>
                    {conv.sessionScore > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        Score: {conv.sessionScore}%
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/practice/${conv._id}`}
                      className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-md transition-all"
                    >
                      {conv.status === 'active' ? 'Continue' : 'Review'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}