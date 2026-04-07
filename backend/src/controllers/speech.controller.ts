import { Response } from 'express';
import { speechService } from '../services/speech.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class SpeechController {
  async analyze(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { conversationId, messageId, transcription, expectedTranscript, audioUrl } = req.body;
      const user = req.user!;

      if (!conversationId || !messageId || !transcription || !expectedTranscript) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await speechService.analyzeSpeech({
        userId: user._id.toString(),
        conversationId,
        messageId,
        transcription,
        expectedTranscript,
        audioUrl: audioUrl || '',
      });

      const shouldFlag = await speechService.shouldFlagForReview(record);

      res.json({
        record,
        shouldFlagForReview: shouldFlag,
        feedback: speechService.generateFeedbackText({
          score: record.pronunciationScore,
          phonemes: record.phonemeAnalysis.phonemes as any,
          problemPhonemes: record.phonemeAnalysis.problemPhonemes,
          suggestions: record.phonemeAnalysis.suggestions,
        }),
      });
    } catch (error: any) {
      console.error('Speech analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze speech' });
    }
  }

  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { limit = '50' } = req.query;
      const limitNum = parseInt(limit as string);

      const records = await speechService.getSpeechHistory(user._id.toString(), limitNum);

      res.json({ records });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get speech history' });
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const stats = await speechService.getSpeechStats(user._id.toString());

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get speech stats' });
    }
  }
}

export const speechController = new SpeechController();
