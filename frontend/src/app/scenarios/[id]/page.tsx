'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mic, ArrowLeft, Clock, Users, BookOpen, Star,
  Loader2, Play, Volume2, ChevronRight, Target
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scenarioService, conversationService } from '@/lib/api';
import { IScenario } from '@/types';

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  elementary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'pre-intermediate': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  intermediate: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'upper-intermediate': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  advanced: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

const CATEGORY_ICONS: Record<string, string> = {
  'daily-life': '🏠', 'travel': '✈️', 'business': '💼', 'academic': '🎓', 'social': '👥',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner', elementary: 'Elementary', 'pre-intermediate': 'Pre-Intermediate',
  intermediate: 'Intermediate', 'upper-intermediate': 'Upper-Intermediate', advanced: 'Advanced',
};

export default function ScenarioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [scenario, setScenario] = useState<IScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
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
    loadScenario();
  }, [isReady, isAuthenticated, params.id]);

  const loadScenario = async () => {
    try {
      const data = await scenarioService.getById(params.id as string);
      setScenario(data.scenario);
    } catch (error) {
      console.error('Failed to load scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = async () => {
    if (!scenario) return;
    setStarting(true);
    try {
      const data = await conversationService.start(scenario._id);
      router.push(`/practice/${data.conversation.id}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setStarting(false);
    }
  };

  const speakWord = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Scenario not found</p>
          <Link href="/scenarios" className="text-blue-600 dark:text-blue-400 font-semibold">
            Back to Scenarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/scenarios" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">ESL Speak</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{CATEGORY_ICONS[scenario.category]}</span>
              <span className={`text-xs px-3 py-1 rounded-lg font-medium ${LEVEL_COLORS[scenario.level]}`}>
                {LEVEL_LABELS[scenario.level]}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{scenario.title}</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-4">{scenario.titleVietnamese}</p>
            <p className="text-slate-600 dark:text-slate-300 mb-6">{scenario.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-slate-900 dark:text-white">{scenario.estimatedDuration} min</div>
                <div className="text-xs text-slate-500">Duration</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <Target className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-slate-900 dark:text-white">{scenario.difficulty}/10</div>
                <div className="text-xs text-slate-500">Difficulty</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <Users className="w-5 h-5 text-pink-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-slate-900 dark:text-white capitalize">{scenario.category.replace('-', ' ')}</div>
                <div className="text-xs text-slate-500">Category</div>
              </div>
            </div>

            <button
              onClick={handleStartPractice}
              disabled={starting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {starting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Play className="w-6 h-6" />
              )}
              {starting ? 'Starting...' : 'Start Practice Session'}
            </button>
          </div>
        </div>

        {/* AI Role */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Your Conversation Partner
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                {scenario.role.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{scenario.role.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{scenario.role.accent} accent • {scenario.role.speakingStyle} style</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">Personality:</span> {scenario.role.personality}
            </p>
          </div>
        </div>

        {/* Vocabulary */}
        {scenario.vocabulary.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Key Vocabulary
            </h2>
            <div className="space-y-3">
              {scenario.vocabulary.map((vocab, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{vocab.word}</span>
                      <span className="text-xs text-slate-400 font-mono">{vocab.phonetic}</span>
                      <button
                        onClick={() => speakWord(vocab.word)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{vocab.meaningVietnamese}</div>
                    <div className="text-xs text-slate-400 mt-1 italic">"{vocab.example}"</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grammar Points */}
        {scenario.grammarPoints.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Grammar Focus
            </h2>
            <div className="flex flex-wrap gap-2">
              {scenario.grammarPoints.map((gp, i) => (
                <span key={i} className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg text-sm">
                  {gp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expected Phrases */}
        {scenario.expectedPhrases.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-green-500" />
              Useful Phrases
            </h2>
            <div className="space-y-2">
              {scenario.expectedPhrases.map((phrase, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <span className="text-green-600 dark:text-green-400 font-semibold">{i + 1}.</span>
                  <span className="text-slate-700 dark:text-slate-300 italic">"{phrase}"</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}