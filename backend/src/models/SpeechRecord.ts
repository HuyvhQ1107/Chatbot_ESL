import mongoose, { Document, Schema } from 'mongoose';

export interface IPhonemeDetail {
  phoneme: string;
  expected: string;
  actual: string;
  match: boolean;
  confidence: number;
  spectrogramUrl?: string;
}

export interface ISpeechPhonemeAnalysis {
  phonemes: IPhonemeDetail[];
  problemPhonemes: string[];
  suggestions: string[];
}

export interface ISpeechRecord extends Document {
  userId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  messageId: string;
  audioUrl: string;
  transcription: string;
  expectedTranscript: string;
  pronunciationScore: number;
  phonemeAnalysis: ISpeechPhonemeAnalysis;
  createdAt: Date;
}

const PhonemeDetailSchema = new Schema<IPhonemeDetail>(
  {
    phoneme: { type: String, required: true },
    expected: { type: String, required: true },
    actual: { type: String, required: true },
    match: { type: Boolean, required: true },
    confidence: { type: Number, required: true },
    spectrogramUrl: { type: String },
  },
  { _id: false }
);

const SpeechPhonemeAnalysisSchema = new Schema<ISpeechPhonemeAnalysis>(
  {
    phonemes: [PhonemeDetailSchema],
    problemPhonemes: [{ type: String }],
    suggestions: [{ type: String }],
  },
  { _id: false }
);

const SpeechRecordSchema = new Schema<ISpeechRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    messageId: { type: String, required: true },
    audioUrl: { type: String, required: true },
    transcription: { type: String, required: true },
    expectedTranscript: { type: String, required: true },
    pronunciationScore: { type: Number, required: true },
    phonemeAnalysis: { type: SpeechPhonemeAnalysisSchema, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SpeechRecordSchema.index({ userId: 1, createdAt: -1 });
SpeechRecordSchema.index({ conversationId: 1 });

export const SpeechRecord = mongoose.model<ISpeechRecord>('SpeechRecord', SpeechRecordSchema);
