import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../models/Conversation';
import { Scenario } from '../models/Scenario';
import { LearningProgress } from '../models/LearningProgress';
import { geminiService, ConversationMessage } from '../services/gemini.service';
import { zpdService } from '../services/zpd.service';
import { speechService } from '../services/speech.service';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

export class ConversationController {
  async start(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { scenarioId } = req.body;
      const user = req.user!;

      if (!scenarioId) {
        res.status(400).json({ error: 'Scenario ID is required' });
        return;
      }

      const scenario = await Scenario.findById(scenarioId);
      if (!scenario) {
        res.status(404).json({ error: 'Scenario not found' });
        return;
      }

      const initialPrompt = await geminiService.generateInitialPrompt(scenario);

      const conversation = new Conversation({
        userId: new mongoose.Types.ObjectId(user._id),
        scenarioId: new mongoose.Types.ObjectId(scenarioId),
        messages: [
          {
            id: uuidv4(),
            role: 'system',
            content: `Starting scenario: ${scenario.title}`,
            timestamp: new Date(),
          },
          {
            id: uuidv4(),
            role: 'assistant',
            content: initialPrompt,
            timestamp: new Date(),
          },
        ],
        status: 'active',
        flaggedForReview: false,
        sessionScore: 0,
        zpdAtTime: user.currentZPD,
        startedAt: new Date(),
      });

      await conversation.save();

      res.status(201).json({
        message: 'Conversation started',
        conversation: {
          id: conversation._id,
          scenarioId: conversation.scenarioId,
          messages: conversation.messages,
          status: conversation.status,
          startedAt: conversation.startedAt,
          scenario: {
            title: scenario.title,
            titleVietnamese: scenario.titleVietnamese,
            level: scenario.level,
            category: scenario.category,
            role: scenario.role,
            vocabulary: scenario.vocabulary,
          },
        },
      });
    } catch (error: any) {
      console.error('Start conversation error:', error);
      res.status(500).json({ error: 'Failed to start conversation: ' + error.message });
    }
  }

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content, transcription, expectedTranscript } = req.body;
      const user = req.user!;

      if (!content && !transcription) {
        res.status(400).json({ error: 'Message content is required' });
        return;
      }

      const conversation = await Conversation.findById(id);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      if (conversation.userId.toString() !== user._id.toString()) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const scenario = await Scenario.findById(conversation.scenarioId);
      if (!scenario) {
        res.status(404).json({ error: 'Scenario not found' });
        return;
      }

      const userMessageId = uuidv4();
      let pronunciationScore = 100;
      const userMessage: any = {
        id: userMessageId,
        role: 'user' as const,
        content: content || transcription,
        transcription: transcription,
        timestamp: new Date(),
      };

      if (transcription && expectedTranscript) {
        const speechRecord = await speechService.analyzeSpeech({
          userId: user._id.toString(),
          conversationId: conversation._id.toString(),
          messageId: userMessageId,
          transcription,
          expectedTranscript,
          audioUrl: '',
        });
        pronunciationScore = speechRecord.pronunciationScore;
        userMessage.pronunciationScore = pronunciationScore;
      }

      conversation.messages.push(userMessage);

      const conversationHistory: ConversationMessage[] = conversation.messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.content,
        }));

      const aiResponse = await geminiService.generateResponse(
        scenario,
        user.level,
        conversationHistory,
        content || transcription
      );

      const assistantMessageId = uuidv4();
      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date(),
      };

      conversation.messages.push(assistantMessage);
      await conversation.save();

      res.json({
        message: 'Message sent',
        userMessage: {
          ...userMessage,
          pronunciationScore,
        },
        assistantMessage,
        feedback: speechService.generateFeedbackText({
          score: pronunciationScore,
          phonemes: [],
          problemPhonemes: [],
          suggestions: [],
        }),
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message: ' + error.message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const conversation = await Conversation.findById(id)
        .populate('scenarioId', 'title titleVietnamese level category role vocabulary grammarPoints');

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      if (conversation.userId.toString() !== user._id.toString() && user.role === 'student') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json({ conversation });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get conversation' });
    }
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { status, page = '1', limit = '20' } = req.query;

      const filter: any = { userId: new mongoose.Types.ObjectId(user._id) };
      if (status) filter.status = status;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const conversations = await Conversation.find(filter)
        .populate('scenarioId', 'title titleVietnamese level category difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Conversation.countDocuments(filter);

      res.json({
        conversations,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list conversations' });
    }
  }

  async complete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { score } = req.body;
      const user = req.user!;

      const conversation = await Conversation.findById(id);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      if (conversation.userId.toString() !== user._id.toString()) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      conversation.status = 'completed';
      conversation.completedAt = new Date();
      conversation.sessionScore = score || Math.round(conversation.messages.length * 5);

      await conversation.save();

      await zpdService.updateUserZPD(user._id.toString(), conversation.sessionScore);

      let progress = await LearningProgress.findOne({
        userId: new mongoose.Types.ObjectId(user._id),
        scenarioId: conversation.scenarioId,
      });

      if (!progress) {
        progress = new LearningProgress({
          userId: new mongoose.Types.ObjectId(user._id),
          scenarioId: conversation.scenarioId,
          attempts: [],
          totalAttempts: 0,
          bestScore: 0,
          averageScore: 0,
          weakPhonemes: [],
          weakGrammarPoints: [],
          vocabularyLearned: [],
          currentStreak: 1,
          longestStreak: 1,
          lastPracticedAt: new Date(),
          masteryLevel: 0,
        });
      }

      const attemptNum = progress.attempts.length + 1;
      progress.attempts.push({
        attemptNumber: attemptNum,
        score: conversation.sessionScore,
        date: new Date(),
        weakAreas: [],
        strongAreas: [],
      });

      progress.totalAttempts = progress.attempts.length;
      progress.bestScore = Math.max(progress.bestScore, conversation.sessionScore);
      progress.averageScore = Math.round(
        progress.attempts.reduce((sum, a) => sum + a.score, 0) / progress.totalAttempts
      );
      progress.lastPracticedAt = new Date();
      progress.masteryLevel = Math.min(100, progress.averageScore + progress.bestScore / 2);

      await progress.save();

      res.json({
        message: 'Conversation completed',
        sessionScore: conversation.sessionScore,
        progress: {
          bestScore: progress.bestScore,
          averageScore: progress.averageScore,
          totalAttempts: progress.totalAttempts,
          masteryLevel: progress.masteryLevel,
        },
      });
    } catch (error: any) {
      console.error('Complete conversation error:', error);
      res.status(500).json({ error: 'Failed to complete conversation' });
    }
  }

  async flagForReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { messageId, reason } = req.body;
      const user = req.user!;

      const conversation = await Conversation.findById(id);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      if (conversation.userId.toString() !== user._id.toString()) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      conversation.flaggedForReview = true;
      conversation.status = 'flagged';

      if (messageId) {
        conversation.reviewFlags.push({
          messageId,
          reason: reason || 'User requested review',
          flaggedAt: new Date(),
        });
      }

      await conversation.save();

      res.json({ message: 'Conversation flagged for review' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to flag conversation' });
    }
  }
}

export const conversationController = new ConversationController();
