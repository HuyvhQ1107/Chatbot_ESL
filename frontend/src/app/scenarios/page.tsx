'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Filter, Mic, Clock, Users, BookOpen,
  Star, Loader2, ChevronRight, X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scenarioService } from '@/lib/api';
import { IScenario } from '@/types';

const LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'pre-intermediate', label: 'Pre-Intermediate' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper-intermediate', label: 'Upper-Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'daily-life', label: 'Daily Life' },
  { value: 'travel', label: 'Travel' },
  { value: 'business', label: 'Business' },
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
];

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  elementary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'pre-intermediate': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  intermediate: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'upper-intermediate': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  advanced: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

const CATEGORY_ICONS: Record<string, string> = {
  'daily-life': '🏠',
  'travel': '✈️',
  'business': '💼',
  'academic': '🎓',
  'social': '👥',
};

const DIFFICULTY_COLOR = (d: number) => {
  if (d <= 3) return 'text-green-600';
  if (d <= 6) return 'text-amber-600';
  return 'text-red-600';
};

export default function ScenariosPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [scenarios, setScenarios] = useState<IScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    setIsReady(true);
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await scenarioService.getAll({
        level: levelFilter || undefined,
        category: categoryFilter || undefined,
        search: search || undefined,
      });
      setScenarios(data.scenarios || []);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
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
    const timer = setTimeout(() => {
      loadScenarios();
    }, 300);
    return () => clearTimeout(timer);
  }, [levelFilter, categoryFilter, search, isReady, isAuthenticated]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const hasFilters = levelFilter || categoryFilter || search;

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
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Practice Scenarios
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Choose a scenario that matches your learning goals and start practicing.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {hasFilters ? 'No scenarios match your filters.' : 'No scenarios available.'}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setLevelFilter(''); setCategoryFilter(''); }}
                className="mt-4 text-blue-600 dark:text-blue-400 font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Showing {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {scenarios.map((scenario) => (
                <Link
                  key={scenario._id}
                  href={`/scenarios/${scenario._id}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Category Banner */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl">{CATEGORY_ICONS[scenario.category]}</span>
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${LEVEL_COLORS[scenario.level]}`}>
                        {scenario.level.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                      {scenario.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      {scenario.titleVietnamese}
                    </p>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                      {scenario.descriptionVietnamese}
                    </p>

                    {/* Vocabulary Preview */}
                    {scenario.vocabulary.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-slate-400 mb-2">Key vocabulary:</div>
                        <div className="flex flex-wrap gap-1">
                          {scenario.vocabulary.slice(0, 3).map((v, i) => (
                            <span key={i} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                              {v.word}
                            </span>
                          ))}
                          {scenario.vocabulary.length > 3 && (
                            <span className="text-xs text-slate-400">+{scenario.vocabulary.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scenario.estimatedDuration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {scenario.role.name}
                        </span>
                      </div>
                      <div className={`text-xs font-semibold ${DIFFICULTY_COLOR(scenario.difficulty)}`}>
                        Level {scenario.difficulty}/10
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}