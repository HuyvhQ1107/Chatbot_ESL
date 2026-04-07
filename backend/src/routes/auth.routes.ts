import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, authLimiter } from '../middleware';

const router = Router();

router.post('/register', authLimiter, authController.register.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.get('/me', authMiddleware, authController.getMe.bind(authController));
router.put('/profile', authMiddleware, authController.updateProfile.bind(authController));
router.get('/teachers', authMiddleware, authController.getTeachers.bind(authController));

export default router;
