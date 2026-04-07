'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic, BookOpen, BarChart2, History, Trophy, Flame, Target,
  TrendingUp, ChevronRight, Star, Loader2, LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { progressService, scenarioService } from '@/lib/api';
import { IDashboardStats, IScenario } from '@/types';

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  elementary: 'Elementary',
  'pre-intermediate': 'Pre-Intermediate',
  intermediate: 'Intermediate',
  'upper-intermediate': 'Upper-Intermediate',
  advanced: 'Advanced',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  elementary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'pre-intermediate': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  intermediate: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'upper-intermediate': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  advanced: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [recommended, setRecommended] = useState<IScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    setIsReady(true);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, recRes] = await Promise.all([
        progressService.getDashboardStats(),
        scenarioService.getRecommended(6),
      ]);
      setStats(statsRes);
      setRecommended(recRes.scenarios || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    setLoading(true);
    loadData();
  }, [isReady, isAuthenticated]);

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
      {/* Header */}
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${LEVEL_COLORS[user?.level || 'elementary']}`}>
                    {LEVEL_LABELS[user?.level || 'elementary']}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Continue your English learning journey. You're currently at{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {LEVEL_LABELS[user?.level || 'elementary']}
                </span>{' '}
                level.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  icon: <Target className="w-5 h-5" />,
                  label: 'Avg. Score',
                  value: stats?.avgScore || 0,
                  suffix: '%',
                  color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
                },
                {
                  icon: <Flame className="w-5 h-5" />,
                  label: 'Practice Sessions',
                  value: stats?.totalPractice || 0,
                  color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
                },
                {
                  icon: <Trophy className="w-5 h-5" />,
                  label: 'Current Streak',
                  value: stats?.currentStreak || 0,
                  suffix: ' days',
                  color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
                },
                {
                  icon: <TrendingUp className="w-5 h-5" />,
                  label: 'Mastery Level',
                  value: stats?.avgMastery || 0,
                  suffix: '%',
                  color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
                },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}{stat.suffix || ''}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { href: '/scenarios', icon: <BookOpen className="w-6 h-6" />, label: 'Browse Scenarios', color: 'from-blue-500 to-indigo-500' },
                { href: '/history', icon: <History className="w-6 h-6" />, label: 'Conversation History', color: 'from-purple-500 to-pink-500' },
                { href: '/progress', icon: <BarChart2 className="w-6 h-6" />, label: 'View Progress', color: 'from-green-500 to-emerald-500' },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className={`bg-gradient-to-br ${action.color} text-white p-5 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all group`}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{action.label}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>

            {/* Recommended Scenarios */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Recommended for You
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Based on your current level and ZPD
                  </p>
                </div>
                <Link
                  href="/scenarios"
                  className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
                >
                  View all
                </Link>
              </div>

              {recommended.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No recommended scenarios yet. Browse all scenarios to get started!
                  </p>
                  <Link
                    href="/scenarios"
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    Browse Scenarios <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommended.map((scenario) => (
                    <Link
                      key={scenario._id}
                      href={`/scenarios/${scenario._id}`}
                      className="group bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${LEVEL_COLORS[scenario.level]}`}>
                          {LEVEL_LABELS[scenario.level]}
                        </span>
                        <span className="text-xs text-slate-400">{scenario.estimatedDuration} min</span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                        {scenario.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        {scenario.titleVietnamese}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="capitalize">{scenario.category.replace('-', ' ')}</span>
                        <span>•</span>
                        <span>Difficulty: {scenario.difficulty}/10</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Weak Phonemes */}
            {stats?.topWeakPhonemes && stats.topWeakPhonemes.length > 0 && (
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Areas to Improve
                </h2>
                <div className="flex flex-wrap gap-2">
                  {stats.topWeakPhonemes.map((wp, i) => (
                    <div key={i} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
                      <span className="font-bold text-orange-700 dark:text-orange-300">{wp.phoneme}</span>
                      <span className="text-xs text-orange-500 ml-2">×{wp.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}