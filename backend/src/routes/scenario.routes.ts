import { Router } from 'express';
import { scenarioController } from '../controllers/scenario.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.get('/', authMiddleware, scenarioController.getAll.bind(scenarioController));
router.get('/recommended', authMiddleware, scenarioController.getRecommended.bind(scenarioController));
router.get('/categories', authMiddleware, scenarioController.getCategories.bind(scenarioController));
router.get('/levels', authMiddleware, scenarioController.getLevels.bind(scenarioController));
router.get('/:id', authMiddleware, scenarioController.getById.bind(scenarioController));

export default router;
