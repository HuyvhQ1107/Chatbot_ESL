import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authMiddleware, teacherOnly } from '../middleware';

const router = Router();

router.get('/pending', authMiddleware, teacherOnly, reviewController.getPending.bind(reviewController));
router.post('/:id/claim', authMiddleware, teacherOnly, reviewController.claimReview.bind(reviewController));
router.post('/:id', authMiddleware, teacherOnly, reviewController.submitReview.bind(reviewController));
router.get('/history', authMiddleware, teacherOnly, reviewController.getHistory.bind(reviewController));
router.get('/student', authMiddleware, reviewController.getStudentReviews.bind(reviewController));
router.get('/:id', authMiddleware, reviewController.getById.bind(reviewController));

export default router;
