'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, MessageSquare, User, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { reviewService } from '@/lib/api';

export default function StudentReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
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
    loadReviews();
  }, [isReady, isAuthenticated]);

  const loadReviews = async () => {
    try {
      const data = await reviewService.getStudentReviews();
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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-bold text-slate-900 dark:text-white">Teacher Feedback</span>
            <div className="w-5" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Teacher Feedback</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No feedback yet. Keep practicing!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {review.teacherId?.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {(review.conversationId as any)?.scenarioId?.title}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                {review.overallFeedback && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 mb-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{review.overallFeedback}</p>
                  </div>
                )}
                {review.recommendedLevel && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Recommended level: <span className="font-semibold">{review.recommendedLevel}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}