import { Router } from 'express';
import { progressController } from '../controllers/progress.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.get('/', authMiddleware, progressController.getProgress.bind(progressController));
router.get('/dashboard', authMiddleware, progressController.getDashboardStats.bind(progressController));
router.get('/:scenarioId', authMiddleware, progressController.getScenarioProgress.bind(progressController));
router.post('/assess', authMiddleware, progressController.submitAssessment.bind(progressController));

export default router;
