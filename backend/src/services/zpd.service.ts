import { User, IUser, ICurrentZPD } from '../models/User';
import { LearningProgress } from '../models/LearningProgress';

const LEVEL_SCORES: Record<string, number> = {
  'beginner': 1,
  'elementary': 2,
  'pre-intermediate': 3,
  'intermediate': 4,
  'upper-intermediate': 5,
  'advanced': 6,
};

const SCORE_LEVELS: Record<number, string> = {
  1: 'beginner',
  2: 'elementary',
  3: 'pre-intermediate',
  4: 'intermediate',
  5: 'upper-intermediate',
  6: 'advanced',
};

export class ZPDService {
  async getInitialZPD(userLevel: string): Promise<ICurrentZPD> {
    const levelNum = LEVEL_SCORES[userLevel] || 2;
    return {
      minLevel: Math.max(1, levelNum - 1),
      maxLevel: Math.min(6, levelNum + 1),
      currentLevel: levelNum,
    };
  }

  calculateAdjustedZPD(
    currentZPD: ICurrentZPD,
    sessionScore: number
  ): ICurrentZPD {
    const { minLevel, maxLevel, currentLevel } = currentZPD;
    let newCurrent = currentLevel;

    if (sessionScore >= 85) {
      newCurrent = Math.min(maxLevel + 1, 6);
      return {
        minLevel: Math.max(1, newCurrent - 1),
        maxLevel: Math.min(6, newCurrent + 1),
        currentLevel: newCurrent,
      };
    }

    if (sessionScore < 50) {
      newCurrent = Math.max(minLevel - 1, 1);
      return {
        minLevel: Math.max(1, newCurrent - 1),
        maxLevel: Math.min(6, newCurrent + 1),
        currentLevel: newCurrent,
      };
    }

    return currentZPD;
  }

  getLevelFromScore(score: number): string {
    if (score >= 90) return 'advanced';
    if (score >= 75) return 'upper-intermediate';
    if (score >= 65) return 'intermediate';
    if (score >= 50) return 'pre-intermediate';
    if (score >= 30) return 'elementary';
    return 'beginner';
  }

  getScaffoldingLevel(zpd: ICurrentZPD): 'high' | 'medium' | 'low' {
    const range = zpd.maxLevel - zpd.minLevel;
    const position = (zpd.currentLevel - zpd.minLevel) / (range || 1);

    if (position < 0.33) return 'high';
    if (position < 0.66) return 'medium';
    return 'low';
  }

  async updateUserZPD(userId: string, sessionScore: number): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    const adjustedZPD = this.calculateAdjustedZPD(user.currentZPD, sessionScore);
    user.currentZPD = adjustedZPD;

    const newLevel = SCORE_LEVELS[adjustedZPD.currentLevel] || user.level;
    user.level = newLevel as IUser['level'];

    await user.save();
    return user;
  }

  async getUserProgressStats(userId: string) {
    const progress = await LearningProgress.find({ userId });

    const totalScenarios = progress.length;
    const totalAttempts = progress.reduce((sum, p) => sum + p.totalAttempts, 0);
    const avgScore = totalScenarios > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.averageScore, 0) / totalScenarios)
      : 0;

    const allWeakPhonemes: Record<string, number> = {};
    for (const p of progress) {
      for (const wp of p.weakPhonemes) {
        allWeakPhonemes[wp.phoneme] = (allWeakPhonemes[wp.phoneme] || 0) + wp.count;
      }
    }

    const topWeakPhonemes = Object.entries(allWeakPhonemes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phoneme, count]) => ({ phoneme, count }));

    const streak = progress.length > 0 ? progress[0].currentStreak : 0;

    return {
      totalScenarios,
      totalAttempts,
      averageScore: avgScore,
      topWeakPhonemes,
      currentStreak: streak,
      masteryDistribution: this.getMasteryDistribution(progress),
    };
  }

  private getMasteryDistribution(progress: any[]) {
    const distribution = {
      notStarted: 0,
      learning: 0,
      proficient: 0,
      mastered: 0,
    };

    for (const p of progress) {
      if (p.totalAttempts === 0) distribution.notStarted++;
      else if (p.masteryLevel < 40) distribution.learning++;
      else if (p.masteryLevel < 75) distribution.proficient++;
      else distribution.mastered++;
    }

    return distribution;
  }

  generateScaffoldingHint(
    type: 'vocabulary' | 'grammar' | 'sentence' | 'encouragement',
    context: { vocabulary?: string[]; grammarPoints?: string[]; expectedPhrase?: string }
  ): string {
    switch (type) {
      case 'vocabulary':
        if (context.vocabulary && context.vocabulary.length > 0) {
          return `Try using: ${context.vocabulary.slice(0, 2).join(', ')}`;
        }
        return 'Try rephrasing your sentence using simpler words.';

      case 'grammar':
        if (context.grammarPoints && context.grammarPoints.length > 0) {
          return `Remember: ${context.grammarPoints[0]}`;
        }
        return 'Check your verb tense.';

      case 'sentence':
        if (context.expectedPhrase) {
          return `You could say: "${context.expectedPhrase}"`;
        }
        return "It's okay to use shorter sentences!";

      case 'encouragement':
        return "You're doing great! Take your time and try again.";
    }
  }
}

export const zpdService = new ZPDService();
