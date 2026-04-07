import mongoose, { Document, Schema } from 'mongoose';

export interface IAttempt {
  attemptNumber: number;
  score: number;
  date: Date;
  weakAreas: string[];
  strongAreas: string[];
}

export interface IWeakPhoneme {
  phoneme: string;
  count: number;
}

export interface IVocabularyLearned {
  word: string;
  timesEncountered: number;
  correctUsageCount: number;
}

export interface ILearningProgress extends Document {
  userId: mongoose.Types.ObjectId;
  scenarioId: mongoose.Types.ObjectId;
  attempts: IAttempt[];
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  weakPhonemes: IWeakPhoneme[];
  weakGrammarPoints: string[];
  vocabularyLearned: IVocabularyLearned[];
  currentStreak: number;
  longestStreak: number;
  lastPracticedAt: Date;
  masteryLevel: number;
}

const AttemptSchema = new Schema<IAttempt>(
  {
    attemptNumber: { type: Number, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    weakAreas: [{ type: String }],
    strongAreas: [{ type: String }],
  },
  { _id: false }
);

const WeakPhonemeSchema = new Schema<IWeakPhoneme>(
  { phoneme: { type: String, required: true }, count: { type: Number, default: 1 } },
  { _id: false }
);

const VocabularyLearnedSchema = new Schema<IVocabularyLearned>(
  {
    word: { type: String, required: true },
    timesEncountered: { type: Number, default: 1 },
    correctUsageCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const LearningProgressSchema = new Schema<ILearningProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
    attempts: [AttemptSchema],
    totalAttempts: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    weakPhonemes: [WeakPhonemeSchema],
    weakGrammarPoints: [{ type: String }],
    vocabularyLearned: [VocabularyLearnedSchema],
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastPracticedAt: { type: Date, default: Date.now },
    masteryLevel: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LearningProgressSchema.index({ userId: 1, scenarioId: 1 }, { unique: true });
LearningProgressSchema.index({ userId: 1, lastPracticedAt: -1 });

export const LearningProgress = mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema);
