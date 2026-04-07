import { Router } from 'express';
import { speechController } from '../controllers/speech.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.post('/analyze', authMiddleware, speechController.analyze.bind(speechController));
router.get('/history', authMiddleware, speechController.getHistory.bind(speechController));
router.get('/stats', authMiddleware, speechController.getStats.bind(speechController));

export default router;
