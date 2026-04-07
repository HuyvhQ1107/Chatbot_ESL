import { Response } from 'express';
import { TeacherReview } from '../models/TeacherReview';
import { Conversation } from '../models/Conversation';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

export class ReviewController {
  async getPending(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      const reviews = await TeacherReview.find({
        status: { $in: ['pending', 'in-progress'] },
      })
        .populate('conversationId', 'userId scenarioId messages sessionScore startedAt completedAt')
        .populate('conversationId.userId', 'name email level')
        .populate('conversationId.scenarioId', 'title level category')
        .sort({ createdAt: 1 })
        .limit(20);

      const pendingReviews = reviews.filter(r => {
        const teacherAssigned = !r.teacherId || r.teacherId.toString() === user._id.toString();
        return teacherAssigned;
      });

      res.json({ reviews: pendingReviews });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get pending reviews' });
    }
  }

  async claimReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const review = await TeacherReview.findById(id);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      review.teacherId = new mongoose.Types.ObjectId(user._id);
      review.status = 'in-progress';
      await review.save();

      res.json({ message: 'Review claimed', review });
    } catch (error) {
      res.status(500).json({ error: 'Failed to claim review' });
    }
  }

  async submitReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reviews, overallFeedback, recommendedLevel, recommendedScenarios } = req.body;
      const user = req.user!;

      const review = await TeacherReview.findById(id);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      review.reviews = reviews || [];
      review.overallFeedback = overallFeedback || '';
      review.recommendedLevel = recommendedLevel || '';
      review.recommendedScenarios = recommendedScenarios || [];
      review.status = 'completed';
      review.completedAt = new Date();

      await review.save();

      await Conversation.updateOne(
        { _id: review.conversationId },
        { status: 'reviewed' }
      );

      res.json({ message: 'Review submitted', review });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit review' });
    }
  }

  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const reviews = await TeacherReview.find({
        teacherId: new mongoose.Types.ObjectId(user._id),
        status: 'completed',
      })
        .populate('conversationId', 'userId scenarioId sessionScore')
        .populate('conversationId.userId', 'name email level')
        .populate('conversationId.scenarioId', 'title level category')
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await TeacherReview.countDocuments({
        teacherId: new mongoose.Types.ObjectId(user._id),
        status: 'completed',
      });

      res.json({
        reviews,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get review history' });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const review = await TeacherReview.findById(id)
        .populate('conversationId')
        .populate('teacherId', 'name email');

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json({ review });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get review' });
    }
  }

  async getStudentReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      const reviews = await TeacherReview.find({
        'conversationId': { $in: await Conversation.find({ userId: user._id }).distinct('_id') },
        status: 'completed',
      })
        .populate('teacherId', 'name email')
        .populate('conversationId', 'scenarioId sessionScore startedAt completedAt')
        .populate('conversationId.scenarioId', 'title level category')
        .sort({ completedAt: -1 });

      res.json({ reviews });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get student reviews' });
    }
  }
}

export const reviewController = new ReviewController();
