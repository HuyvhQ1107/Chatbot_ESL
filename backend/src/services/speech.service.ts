import { SpeechRecord, ISpeechRecord } from '../models/SpeechRecord';
import { Conversation } from '../models/Conversation';
import { phonemeService, PhonemeAnalysisResult } from './phoneme.service';
import mongoose from 'mongoose';

export interface AnalyzeSpeechParams {
  userId: string;
  conversationId: string;
  messageId: string;
  transcription: string;
  expectedTranscript: string;
  audioUrl: string;
}

export class SpeechService {
  async analyzeSpeech(params: AnalyzeSpeechParams): Promise<ISpeechRecord> {
    const analysis = phonemeService.analyzePhonemes(
      params.transcription,
      params.expectedTranscript
    );

    const speechRecord = new SpeechRecord({
      userId: new mongoose.Types.ObjectId(params.userId),
      conversationId: new mongoose.Types.ObjectId(params.conversationId),
      messageId: params.messageId,
      audioUrl: params.audioUrl,
      transcription: params.transcription,
      expectedTranscript: params.expectedTranscript,
      pronunciationScore: analysis.score,
      phonemeAnalysis: {
        phonemes: analysis.phonemes,
        problemPhonemes: analysis.problemPhonemes,
        suggestions: analysis.suggestions,
      },
    });

    await speechRecord.save();

    await Conversation.updateOne(
      { _id: params.conversationId, 'messages.id': params.messageId },
      {
        $set: {
          'messages.$.pronunciationScore': analysis.score,
          'messages.$.phoneticAnalysis': {
            phonemes: analysis.phonemes,
            problemPhonemes: analysis.problemPhonemes,
          },
        },
      }
    );

    return speechRecord;
  }

  async getSpeechHistory(userId: string, limit = 50): Promise<ISpeechRecord[]> {
    return SpeechRecord.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('conversationId', 'scenarioId');
  }

  async getSpeechStats(userId: string) {
    const records = await SpeechRecord.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (records.length === 0) {
      return {
        totalRecordings: 0,
        averageScore: 0,
        bestScore: 0,
        commonProblems: [],
      };
    }

    const scores = records.map(r => r.pronunciationScore);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const bestScore = Math.max(...scores);

    const problemCounts: Record<string, number> = {};
    for (const record of records) {
      for (const problem of record.phonemeAnalysis.problemPhonemes) {
        problemCounts[problem] = (problemCounts[problem] || 0) + 1;
      }
    }

    const commonProblems = Object.entries(problemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phoneme, count]) => ({
        phoneme,
        description: phonemeService.getPhonemeDescription(phoneme),
        count,
        suggestions: phonemeService.getCommonMistakes(phoneme),
      }));

    return {
      totalRecordings: records.length,
      averageScore,
      bestScore,
      commonProblems,
    };
  }

  async shouldFlagForReview(speechRecord: ISpeechRecord): Promise<boolean> {
    if (speechRecord.pronunciationScore < 60) {
      return true;
    }

    if (speechRecord.phonemeAnalysis.problemPhonemes.length >= 3) {
      return true;
    }

    return false;
  }

  generateFeedbackText(analysis: PhonemeAnalysisResult): string {
    if (analysis.score >= 90) {
      return "Excellent pronunciation! Your speech is very clear and natural.";
    }
    if (analysis.score >= 75) {
      const suggestions = analysis.suggestions.slice(0, 2).join(' ');
      return `Good job! Your pronunciation is mostly clear. ${suggestions}`;
    }
    if (analysis.score >= 60) {
      const suggestions = analysis.suggestions.slice(0, 3).join(' ');
      return `Nice effort! Here are some areas to improve: ${suggestions}`;
    }
    if (analysis.score >= 40) {
      return `Keep practicing! Focus on the problem sounds: ${analysis.problemPhonemes.join(', ') || 'basic sounds'}. ${analysis.suggestions[0] || ''}`;
    }
    return `Don't worry, pronunciation takes practice! Focus on: ${analysis.problemPhonemes.join(', ') || 'listening to native speakers'}. Try speaking slowly and clearly.`;
  }
}

export const speechService = new SpeechService();
