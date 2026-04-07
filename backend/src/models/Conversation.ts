import mongoose, { Document, Schema } from 'mongoose';

export type MessageRole = 'user' | 'assistant' | 'system';
export type ConversationStatus = 'active' | 'completed' | 'flagged' | 'reviewed';

export interface IPhonemeAnalysis {
  phonemes: {
    phoneme: string;
    expected: string;
    match: boolean;
    confidence: number;
  }[];
  problemPhonemes: string[];
}

export interface IConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  audioUrl?: string;
  transcription?: string;
  pronunciationScore?: number;
  phoneticAnalysis?: IPhonemeAnalysis;
  timestamp: Date;
}

export interface IReviewFlag {
  messageId: string;
  reason: string;
  flaggedAt: Date;
}

export interface IZPDSnapshot {
  minLevel: number;
  maxLevel: number;
  currentLevel: number;
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  scenarioId: mongoose.Types.ObjectId;
  messages: IConversationMessage[];
  status: ConversationStatus;
  flaggedForReview: boolean;
  reviewFlags: IReviewFlag[];
  sessionScore: number;
  zpdAtTime: IZPDSnapshot;
  startedAt: Date;
  completedAt?: Date;
}

const PhonemeSchema = new Schema(
  {
    phoneme: { type: String, required: true },
    expected: { type: String, required: true },
    match: { type: Boolean, required: true },
    confidence: { type: Number, required: true },
  },
  { _id: false }
);

const PhonemeAnalysisSchema = new Schema<IPhonemeAnalysis>(
  {
    phonemes: [PhonemeSchema],
    problemPhonemes: [{ type: String }],
  },
  { _id: false }
);

const ConversationMessageSchema = new Schema<IConversationMessage>(
  {
    id: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: { type: String, required: true },
    audioUrl: { type: String },
    transcription: { type: String },
    pronunciationScore: { type: Number },
    phoneticAnalysis: { type: PhonemeAnalysisSchema },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReviewFlagSchema = new Schema<IReviewFlag>(
  {
    messageId: { type: String, required: true },
    reason: { type: String, required: true },
    flaggedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ZPDSnapshotSchema = new Schema<IZPDSnapshot>(
  {
    minLevel: { type: Number, required: true },
    maxLevel: { type: Number, required: true },
    currentLevel: { type: Number, required: true },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
    messages: [ConversationMessageSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'flagged', 'reviewed'],
      default: 'active',
    },
    flaggedForReview: { type: Boolean, default: false },
    reviewFlags: [ReviewFlagSchema],
    sessionScore: { type: Number, default: 0 },
    zpdAtTime: { type: ZPDSnapshotSchema, required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ status: 1, flaggedForReview: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
