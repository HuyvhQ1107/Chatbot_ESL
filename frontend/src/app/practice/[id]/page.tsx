'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mic, MicOff, Send, ArrowLeft, Volume2, VolumeX,
  X, CheckCircle, AlertCircle, Loader2, ChevronUp,
  ChevronDown, BookOpen, Sparkles, Clock, Target
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';
import { conversationService } from '@/lib/api';
import { IMessage, IScenario } from '@/types';

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  elementary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'pre-intermediate': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  intermediate: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'upper-intermediate': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  advanced: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const { conversationId, scenario, messages, isLoading, isSending, setConversation, addMessage, setLoading, setSending, reset } = useConversationStore();

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [showVocab, setShowVocab] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
    if (!conversationId || conversationId !== params.id) {
      loadConversation();
    }
    return () => {
      stopRecording();
      reset();
    };
  }, [isReady, isAuthenticated, params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    setLoading(true);
    try {
      const data = await conversationService.getById(params.id as string);
      const conv = data.conversation;
      setConversation(
        conv._id,
        conv.scenario as IScenario,
        conv.messages.filter((m: IMessage) => m.role !== 'system')
      );
    } catch (error) {
      console.error('Failed to load conversation:', error);
      router.push('/scenarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput('');
    setTranscription('');

    const userMsg: IMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    setSending(true);
    try {
      const response = await conversationService.sendMessage(
        conversationId!,
        content,
        transcription || undefined,
        undefined
      );

      if (response.assistantMessage) {
        addMessage(response.assistantMessage);
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      const errorMsg: IMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      addMessage(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const startRecording = () => {
    if (typeof window === 'undefined' || !('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setTranscription(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert('Please allow microphone access to use voice input.');
      }
      // 'no-speech' and 'aborted' are normal - user just didn't say anything
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Read the latest transcription value from the closure captured at onresult time
      setTranscription((prev) => {
        if (prev) setInput(prev);
        return prev;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const giveHint = () => {
    if (!scenario) return;
    const hints = [
      `Try using: "${scenario.vocabulary[0]?.word || 'some vocabulary'}" from this scenario`,
      `Remember: ${scenario.grammarPoints[0] || 'Check your grammar'}`,
      `You could say something about ${scenario.title.toLowerCase()}`,
      "It's okay to use short sentences!",
      "Try to use vocabulary from the scenario.",
    ];
    setHintText(hints[Math.floor(Math.random() * hints.length)]);
    setShowHint(true);
  };

  const handleComplete = async () => {
    if (!conversationId) return;
    setSending(true);
    try {
      const score = Math.round(messages.length * 5);
      const result = await conversationService.complete(conversationId, score);
      setSessionScore(result.sessionScore || score);
      setSessionComplete(true);
    } catch (error) {
      console.error('Complete error:', error);
      setSessionScore(Math.round(messages.length * 5));
      setSessionComplete(true);
    } finally {
      setSending(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center animate-bounce-in">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Session Complete!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Great job practicing with {scenario?.role.name}!
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5 mb-6">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {sessionScore}%
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Session Score</div>
          </div>
          <div className="space-y-3 mb-8">
            <Link
              href="/scenarios"
              className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Practice Another Scenario
            </Link>
            <Link
              href="/dashboard"
              className="block w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link href="/scenarios" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Exit Practice</span>
            </Link>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 dark:text-white">{scenario?.title}</div>
              <div className="text-xs text-slate-500">{scenario?.role.name}</div>
            </div>
            <button
              onClick={handleComplete}
              disabled={isSending || messages.length < 2}
              className="text-xs px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
        {/* Scenario Info Bar */}
        {scenario && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4 text-white text-xs">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {scenario.vocabulary.length} vocab
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{scenario.estimatedDuration} min
                </span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${LEVEL_COLORS[scenario.level]} bg-white/20`}>
                  {scenario.level.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVocab(!showVocab)}
                  className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded"
                >
                  <BookOpen className="w-3 h-3" />
                  {showVocab ? 'Hide' : 'Vocab'}
                </button>
                <button
                  onClick={giveHint}
                  className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded"
                >
                  <Sparkles className="w-3 h-3" />
                  Hint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vocabulary Panel */}
        {showVocab && scenario && scenario.vocabulary.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800 px-4 py-3 flex-shrink-0 max-h-48 overflow-y-auto scrollbar-thin">
            <div className="max-w-4xl mx-auto">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">Key Vocabulary:</div>
              <div className="flex flex-wrap gap-2">
                {scenario.vocabulary.map((v, i) => (
                  <div key={i} className="bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{v.word}</span>
                    <span className="text-xs text-slate-400 font-mono">{v.phonetic}</span>
                    <button onClick={() => speakText(v.word)} className="text-blue-500 hover:text-blue-700">
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border-b border-blue-200 dark:border-blue-800 px-4 py-3 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300">{hintText}</span>
              </div>
              <button onClick={() => setShowHint(false)} className="text-blue-400 hover:text-blue-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0">
                    {scenario?.role.name.charAt(0) || 'AI'}
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-2xl px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="mt-2 text-xs flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <Volume2 className="w-3 h-3" />
                        Listen
                      </button>
                    )}
                  </div>
                  {msg.role === 'user' && msg.pronunciationScore !== undefined && (
                    <div className={`mt-1 text-xs text-right flex items-center justify-end gap-1 ${msg.pronunciationScore >= 80 ? 'text-green-600' : msg.pronunciationScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {msg.pronunciationScore >= 80 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      Score: {msg.pronunciationScore}%
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3 flex-shrink-0">
                    U
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0">
                  {scenario?.role.name.charAt(0) || 'AI'}
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-slate-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {transcription && (
              <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 flex items-center justify-between">
                <span>🎤 Heard: "{transcription}"</span>
                <button onClick={() => setTranscription('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleRecording}
                className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-recording shadow-lg shadow-red-500/25'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message or use the microphone..."
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-slate-400">
                Press Enter to send, Shift+Enter for new line
              </span>
              <span className="text-xs text-slate-400">{messages.filter(m => m.role === 'user').length} messages sent</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}