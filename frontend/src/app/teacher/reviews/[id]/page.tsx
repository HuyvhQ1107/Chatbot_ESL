'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Send, User, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { reviewService } from '@/lib/api';

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [form, setForm] = useState({
    overallFeedback: '',
    recommendedLevel: '',
  });

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
    loadReview();
  }, [isReady, isAuthenticated, user?.role, params.id]);

  const loadReview = async () => {
    try {
      const data = await reviewService.getPending();
      const found = (data.reviews || []).find((r: any) => r._id === params.id);
      if (found) {
        setReview(found);
        setForm({
          overallFeedback: found.overallFeedback || '',
          recommendedLevel: found.recommendedLevel || '',
        });
      }
    } catch (error) {
      console.error('Failed to load review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!review) return;
    setSubmitting(true);
    try {
      await reviewService.submitReview(review._id, {
        reviews: [],
        overallFeedback: form.overallFeedback,
        recommendedLevel: form.recommendedLevel,
        recommendedScenarios: [],
      });
      router.push('/teacher/reviews');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Review not found.</p>
          <Link href="/teacher/reviews" className="text-blue-600 dark:text-blue-400 font-semibold">
            Back to Reviews
          </Link>
        </div>
      </div>
    );
  }

  const conversation = review.conversationId;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/teacher/reviews" className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <span className="font-bold text-slate-900 dark:text-white">Review Session</span>
            <div className="w-12" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{conversation?.userId?.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {conversation?.scenarioId?.title} • Level: {conversation?.userId?.level} • Score: {conversation?.sessionScore || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Messages */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
            {(conversation?.messages || []).filter((m: any) => m.role !== 'system').map((msg: any, i: number) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 rounded-br-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <div className="text-xs opacity-50 mt-1">{msg.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Feedback</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Overall Feedback
              </label>
              <textarea
                value={form.overallFeedback}
                onChange={(e) => setForm({ ...form, overallFeedback: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Provide encouraging and constructive feedback for the student..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Recommended Level
              </label>
              <select
                value={form.recommendedLevel}
                onChange={(e) => setForm({ ...form, recommendedLevel: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Keep current level</option>
                <option value="beginner">Beginner</option>
                <option value="elementary">Elementary</option>
                <option value="pre-intermediate">Pre-Intermediate</option>
                <option value="intermediate">Intermediate</option>
                <option value="upper-intermediate">Upper-Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !form.overallFeedback}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}