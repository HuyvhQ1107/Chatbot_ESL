'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Target, Flame, Trophy, TrendingUp, BarChart2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { progressService } from '@/lib/api';

export default function ProgressPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<any>(null);
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
    loadProgress();
  }, [isReady, isAuthenticated]);

  const loadProgress = async () => {
    try {
      const result = await progressService.getProgress();
      setData(result);
    } catch (error) {
      console.error('Failed to load progress:', error);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Learning Progress</span>
            <div className="w-5" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <Target className="w-5 h-5" />, label: 'Avg Score', value: `${data?.stats?.averageScore || 0}%`, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                { icon: <BarChart2 className="w-5 h-5" />, label: 'Scenarios Tried', value: data?.stats?.totalScenarios || 0, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
                { icon: <Flame className="w-5 h-5" />, label: 'Current Streak', value: `${data?.stats?.currentStreak || 0} days`, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
                { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg Mastery', value: `${data?.stats?.averageScore || 0}%`, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>{stat.icon}</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Weak Phonemes */}
            {data?.stats?.topWeakPhonemes?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Phonemes to Practice</h2>
                <div className="flex flex-wrap gap-2">
                  {data.stats.topWeakPhonemes.map((wp: any, i: number) => (
                    <div key={i} className="bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2 text-center">
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{wp.phoneme}</div>
                      <div className="text-xs text-orange-500">×{wp.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Progress */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
              {(!data?.recentProgress || data.recentProgress.length === 0) ? (
                <div className="text-center py-8">
                  <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No practice sessions yet.</p>
                  <Link href="/scenarios" className="text-blue-600 dark:text-blue-400 font-semibold mt-2 inline-block">
                    Start practicing!
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentProgress.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {(p.scenarioId as any)?.title || 'Scenario'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {(p.scenarioId as any)?.titleVietnamese} • {p.totalAttempts} attempts
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{p.masteryLevel}%</div>
                        <div className="text-xs text-slate-500">Mastery</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}