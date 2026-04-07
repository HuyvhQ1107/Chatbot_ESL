import mongoose, { Document, Schema } from 'mongoose';

export type ReviewType = 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency' | 'general';
export type ReviewSeverity = 'minor' | 'major' | 'critical';
export type ReviewStatus = 'pending' | 'in-progress' | 'completed';

export interface IMessageReview {
  messageId: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  grammarNotes: string;
  pronunciationNotes: string;
  type: ReviewType;
  severity: ReviewSeverity;
}

export interface ITeacherReview extends Document {
  conversationId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  reviews: IMessageReview[];
  overallFeedback: string;
  recommendedLevel: string;
  recommendedScenarios: mongoose.Types.ObjectId[];
  status: ReviewStatus;
  createdAt: Date;
  completedAt?: Date;
}

const MessageReviewSchema = new Schema<IMessageReview>(
  {
    messageId: { type: String, required: true },
    originalText: { type: String, required: true },
    correctedText: { type: String, required: true },
    explanation: { type: String, required: true },
    grammarNotes: { type: String, default: '' },
    pronunciationNotes: { type: String, default: '' },
    type: {
      type: String,
      enum: ['grammar', 'vocabulary', 'pronunciation', 'fluency', 'general'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['minor', 'major', 'critical'],
      default: 'minor',
    },
  },
  { _id: false }
);

const TeacherReviewSchema = new Schema<ITeacherReview>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviews: [MessageReviewSchema],
    overallFeedback: { type: String, default: '' },
    recommendedLevel: { type: String, default: '' },
    recommendedScenarios: [{ type: Schema.Types.ObjectId, ref: 'Scenario' }],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    completedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TeacherReviewSchema.index({ teacherId: 1, status: 1 });
TeacherReviewSchema.index({ conversationId: 1 });

export const TeacherReview = mongoose.model<ITeacherReview>('TeacherReview', TeacherReviewSchema);
