'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Clock, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { reviewService } from '@/lib/api';

const STATUS_ICONS: Record<string, any> = {
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  'in-progress': <AlertCircle className="w-4 h-4 text-blue-500" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
};

export default function TeacherReviewsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated || (user?.role !== 'teacher' && user?.role !== 'admin')) {
      router.replace('/dashboard');
      return;
    }
    loadReviews();
  }, [isReady, isAuthenticated, user?.role]);

  const loadReviews = async () => {
    try {
      const data = await reviewService.getPending();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/teacher/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <span className="font-bold text-slate-900 dark:text-white">Reviews</span>
            <div className="w-12" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Pending Reviews
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              No pending reviews!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <Link
                key={review._id}
                href={`/teacher/reviews/${review._id}`}
                className="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {STATUS_ICONS[review.status]}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {review.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {(review.conversationId as any)?.scenarioId?.title || 'Scenario'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Student: {(review.conversationId as any)?.userId?.name}
                      {' • '}
                      Level: {(review.conversationId as any)?.userId?.level}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Score: {(review.conversationId as any)?.sessionScore || 0}%
                      {' • '}
                      Messages: {(review.conversationId as any)?.messages?.length || 0}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}