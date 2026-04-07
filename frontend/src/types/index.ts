export type UserRole = 'student' | 'teacher' | 'admin';
export type UserLevel = 'beginner' | 'elementary' | 'pre-intermediate' | 'intermediate' | 'upper-intermediate' | 'advanced';

export interface ICurrentZPD {
  minLevel: number;
  maxLevel: number;
  currentLevel: number;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  level: UserLevel;
  currentZPD: ICurrentZPD;
  createdAt?: string;
}

export type ScenarioCategory = 'daily-life' | 'travel' | 'business' | 'academic' | 'social';

export interface IScenarioRole {
  name: string;
  personality: string;
  accent: string;
  speakingStyle: string;
}

export interface IScenarioPrompt {
  order: number;
  text: string;
  context: string;
}

export interface IScenarioVocabulary {
  word: string;
  phonetic: string;
  meaningVietnamese: string;
  example: string;
}

export interface IScenario {
  _id: string;
  title: string;
  titleVietnamese: string;
  description: string;
  descriptionVietnamese: string;
  category: ScenarioCategory;
  level: UserLevel;
  difficulty: number;
  tags: string[];
  role: IScenarioRole;
  prompts: IScenarioPrompt[];
  vocabulary: IScenarioVocabulary[];
  grammarPoints: string[];
  expectedPhrases: string[];
  estimatedDuration: number;
  isActive: boolean;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface IMessage {
  id: string;
  role: MessageRole;
  content: string;
  transcription?: string;
  pronunciationScore?: number;
  timestamp: Date;
}

export interface IConversation {
  _id: string;
  userId: string;
  scenarioId: string;
  messages: IMessage[];
  status: 'active' | 'completed' | 'flagged' | 'reviewed';
  flaggedForReview: boolean;
  sessionScore: number;
  zpdAtTime: ICurrentZPD;
  startedAt: string;
  completedAt?: string;
  scenario?: IScenario;
}

export interface IReview {
  _id: string;
  conversationId: IConversation;
  teacherId: IUser;
  reviews: {
    messageId: string;
    originalText: string;
    correctedText: string;
    explanation: string;
    grammarNotes: string;
    pronunciationNotes: string;
    type: 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency' | 'general';
    severity: 'minor' | 'major' | 'critical';
  }[];
  overallFeedback: string;
  recommendedLevel: string;
  recommendedScenarios: string[];
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface IDashboardStats {
  totalPractice: number;
  avgMastery: number;
  avgScore: number;
  currentStreak: number;
  longestStreak: number;
  topWeakPhonemes: { phoneme: string; count: number }[];
  weeklyData: { day: string; score: number }[];
  masteryDistribution: {
    notStarted: number;
    learning: number;
    proficient: number;
    mastered: number;
  };
  level: UserLevel;
  currentZPD: ICurrentZPD;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
  message: string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}