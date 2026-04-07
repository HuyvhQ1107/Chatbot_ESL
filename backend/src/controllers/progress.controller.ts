import { Response } from 'express';
import { LearningProgress } from '../models/LearningProgress';
import { zpdService } from '../services/zpd.service';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

export class ProgressController {
  async getProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const stats = await zpdService.getUserProgressStats(user._id.toString());

      const progress = await LearningProgress.find({ userId: user._id })
        .populate('scenarioId', 'title titleVietnamese level category difficulty')
        .sort({ lastPracticedAt: -1 })
        .limit(20);

      res.json({
        stats,
        recentProgress: progress,
        currentZPD: user.currentZPD,
        level: user.level,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get progress' });
    }
  }

  async getScenarioProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { scenarioId } = req.params;
      const user = req.user!;

      const progress = await LearningProgress.findOne({
        userId: new mongoose.Types.ObjectId(user._id),
        scenarioId: new mongoose.Types.ObjectId(scenarioId),
      }).populate('scenarioId', 'title titleVietnamese level category difficulty vocabulary');

      if (!progress) {
        res.status(404).json({ error: 'No progress found for this scenario' });
        return;
      }

      res.json({ progress });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get scenario progress' });
    }
  }

  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      const allProgress = await LearningProgress.find({ userId: user._id });

      const totalPractice = allProgress.reduce((sum, p) => sum + p.totalAttempts, 0);
      const avgMastery = allProgress.length > 0
        ? Math.round(allProgress.reduce((sum, p) => sum + p.masteryLevel, 0) / allProgress.length)
        : 0;
      const avgScore = allProgress.length > 0
        ? Math.round(allProgress.reduce((sum, p) => sum + p.averageScore, 0) / allProgress.length)
        : 0;

      const currentStreak = allProgress.length > 0 ? allProgress[0].currentStreak : 0;
      const longestStreak = allProgress.length > 0
        ? Math.max(...allProgress.map(p => p.longestStreak))
        : 0;

      const weakPhonemesMap: Record<string, number> = {};
      for (const p of allProgress) {
        for (const wp of p.weakPhonemes) {
          weakPhonemesMap[wp.phoneme] = (weakPhonemesMap[wp.phoneme] || 0) + wp.count;
        }
      }
      const topWeakPhonemes = Object.entries(weakPhonemesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([phoneme, count]) => ({ phoneme, count }));

      const weeklyData = this.getWeeklyData(allProgress);

      res.json({
        totalPractice,
        avgMastery,
        avgScore,
        currentStreak,
        longestStreak,
        topWeakPhonemes,
        weeklyData,
        masteryDistribution: {
          notStarted: 0,
          learning: allProgress.filter(p => p.masteryLevel < 40).length,
          proficient: allProgress.filter(p => p.masteryLevel >= 40 && p.masteryLevel < 75).length,
          mastered: allProgress.filter(p => p.masteryLevel >= 75).length,
        },
        level: user.level,
        currentZPD: user.currentZPD,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
  }

  private getWeeklyData(progressList: any[]): { day: string; score: number }[] {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map(day => ({ day, score: 0 }));

    for (const progress of progressList) {
      for (const attempt of progress.attempts) {
        const date = new Date(attempt.date);
        const dayIndex = date.getDay();
        weeklyData[dayIndex].score = Math.max(weeklyData[dayIndex].score, attempt.score);
      }
    }

    return weeklyData;
  }

  async submitAssessment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { score, level } = req.body;
      const user = req.user!;

      if (score === undefined) {
        res.status(400).json({ error: 'Score is required' });
        return;
      }

      const newLevel = zpdService.getLevelFromScore(score);
      const newZPD = await zpdService.getInitialZPD(newLevel);

      user.level = newLevel as any;
      user.currentZPD = newZPD;
      await user.save();

      res.json({
        message: 'Assessment recorded',
        newLevel,
        newZPD,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit assessment' });
    }
  }
}

export const progressController = new ProgressController();
