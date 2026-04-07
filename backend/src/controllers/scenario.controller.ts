import { Response } from 'express';
import { Scenario } from '../models/Scenario';
import { AuthRequest } from '../middleware/auth.middleware';

export class ScenarioController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { level, category, search, page = '1', limit = '20' } = req.query;

      const filter: any = { isActive: true };

      if (level) filter.level = level;
      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ];
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const scenarios = await Scenario.find(filter)
        .sort({ level: 1, difficulty: 1 })
        .skip(skip)
        .limit(limitNum)
        .select('-flaggablePhrases');

      const total = await Scenario.countDocuments(filter);

      res.json({
        scenarios,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Get scenarios error:', error);
      res.status(500).json({ error: 'Failed to get scenarios' });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const scenario = await Scenario.findById(id);

      if (!scenario) {
        res.status(404).json({ error: 'Scenario not found' });
        return;
      }

      res.json({ scenario });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get scenario' });
    }
  }

  async getRecommended(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { limit = '10' } = req.query;
      const limitNum = parseInt(limit as string);

      const targetLevel = user.level;
      const zpdLevels = [
        user.currentZPD.minLevel === 1 ? 'beginner' :
        user.currentZPD.minLevel === 2 ? 'elementary' :
        user.currentZPD.minLevel === 3 ? 'pre-intermediate' :
        user.currentZPD.minLevel === 4 ? 'intermediate' :
        user.currentZPD.minLevel === 5 ? 'upper-intermediate' : 'advanced',
        targetLevel,
        user.currentZPD.maxLevel === 6 ? 'advanced' :
        user.currentZPD.maxLevel === 5 ? 'upper-intermediate' :
        user.currentZPD.maxLevel === 4 ? 'intermediate' :
        user.currentZPD.maxLevel === 3 ? 'pre-intermediate' :
        user.currentZPD.maxLevel === 2 ? 'elementary' : 'beginner',
      ];

      const scenarios = await Scenario.find({
        isActive: true,
        level: { $in: zpdLevels },
      })
        .sort({ difficulty: 1 })
        .limit(limitNum)
        .select('-flaggablePhrases');

      res.json({ scenarios });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get recommended scenarios' });
    }
  }

  async getCategories(req: AuthRequest, res: Response): Promise<void> {
    try {
      const categories = await Scenario.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      res.json({ categories });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get categories' });
    }
  }

  async getLevels(req: AuthRequest, res: Response): Promise<void> {
    try {
      const levels = await Scenario.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$level', count: { $sum: 1 }, avgDifficulty: { $avg: '$difficulty' } } },
        { $sort: { _id: 1 } },
      ]);

      res.json({ levels });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get levels' });
    }
  }
}

export const scenarioController = new ScenarioController();
