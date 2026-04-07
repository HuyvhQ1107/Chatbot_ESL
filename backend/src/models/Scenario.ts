import mongoose, { Document, Schema } from 'mongoose';

export type ScenarioCategory = 'daily-life' | 'travel' | 'business' | 'academic' | 'social';
export type ScenarioLevel = 'beginner' | 'elementary' | 'pre-intermediate' | 'intermediate' | 'upper-intermediate' | 'advanced';

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

export interface IScenario extends Document {
  title: string;
  titleVietnamese: string;
  description: string;
  descriptionVietnamese: string;
  category: ScenarioCategory;
  level: ScenarioLevel;
  difficulty: number;
  tags: string[];
  role: IScenarioRole;
  prompts: IScenarioPrompt[];
  vocabulary: IScenarioVocabulary[];
  grammarPoints: string[];
  expectedPhrases: string[];
  flaggablePhrases: string[];
  estimatedDuration: number;
  isActive: boolean;
}

const ScenarioRoleSchema = new Schema<IScenarioRole>(
  {
    name: { type: String, required: true },
    personality: { type: String, required: true },
    accent: { type: String, default: 'American' },
    speakingStyle: { type: String, default: 'friendly' },
  },
  { _id: false }
);

const ScenarioPromptSchema = new Schema<IScenarioPrompt>(
  {
    order: { type: Number, required: true },
    text: { type: String, required: true },
    context: { type: String, default: '' },
  },
  { _id: false }
);

const ScenarioVocabularySchema = new Schema<IScenarioVocabulary>(
  {
    word: { type: String, required: true },
    phonetic: { type: String, required: true },
    meaningVietnamese: { type: String, required: true },
    example: { type: String, required: true },
  },
  { _id: false }
);

const ScenarioSchema = new Schema<IScenario>(
  {
    title: { type: String, required: true },
    titleVietnamese: { type: String, required: true },
    description: { type: String, required: true },
    descriptionVietnamese: { type: String, required: true },
    category: {
      type: String,
      enum: ['daily-life', 'travel', 'business', 'academic', 'social'],
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'elementary', 'pre-intermediate', 'intermediate', 'upper-intermediate', 'advanced'],
      required: true,
    },
    difficulty: { type: Number, required: true, min: 1, max: 10 },
    tags: [{ type: String }],
    role: { type: ScenarioRoleSchema, required: true },
    prompts: [ScenarioPromptSchema],
    vocabulary: [ScenarioVocabularySchema],
    grammarPoints: [{ type: String }],
    expectedPhrases: [{ type: String }],
    flaggablePhrases: [{ type: String }],
    estimatedDuration: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ScenarioSchema.index({ level: 1, category: 1 });
ScenarioSchema.index({ isActive: 1 });

export const Scenario = mongoose.model<IScenario>('Scenario', ScenarioSchema);
