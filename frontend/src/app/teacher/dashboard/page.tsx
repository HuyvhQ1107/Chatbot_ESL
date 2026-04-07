'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Mic, CheckCircle, Clock, Loader2, ArrowRight, BarChart2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { reviewService, progressService } from '@/lib/api';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [pending, setPending] = useState<any[]>([]);
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
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    loadData();
  }, [isReady, isAuthenticated, user?.role]);

  const loadData = async () => {
    try {
      const data = await reviewService.getPending();
      setPending(data.reviews || []);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'teacher' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ESL Speak
              </span>
            </Link>
            <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
              Teacher Panel
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Review student conversations and provide feedback.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Pending Reviews */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Pending Reviews
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Conversations waiting for teacher feedback
                  </p>
                </div>
                <Link
                  href="/teacher/reviews"
                  className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {pending.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No pending reviews! Great job staying on top of things.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.slice(0, 5).map((review: any) => (
                    <Link
                      key={review._id}
                      href={`/teacher/reviews/${review._id}`}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {(review.conversationId as any)?.scenarioId?.title || 'Scenario'}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Student: {(review.conversationId as any)?.userId?.name}
                          {' • '}
                          Score: {(review.conversationId as any)?.sessionScore || 0}%
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: <Users className="w-5 h-5" />, label: 'Pending Reviews', value: pending.length, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                { icon: <CheckCircle className="w-5 h-5" />, label: 'Completed', value: 0, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                { icon: <BarChart2 className="w-5 h-5" />, label: 'This Week', value: 0, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>{stat.icon}</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}