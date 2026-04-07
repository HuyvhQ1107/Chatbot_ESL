import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { authMiddleware, conversationLimiter } from '../middleware';

const router = Router();

router.post('/', authMiddleware, conversationLimiter, conversationController.start.bind(conversationController));
router.get('/', authMiddleware, conversationController.list.bind(conversationController));
router.get('/:id', authMiddleware, conversationController.getById.bind(conversationController));
router.post('/:id/messages', authMiddleware, conversationLimiter, conversationController.sendMessage.bind(conversationController));
router.post('/:id/complete', authMiddleware, conversationController.complete.bind(conversationController));
router.post('/:id/flag', authMiddleware, conversationController.flagForReview.bind(conversationController));

export default router;
