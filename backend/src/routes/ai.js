import { Router } from 'express';
import { body } from 'express-validator';
import {
  suggestPriority,
  generateWeeklyReport,
  generateSummary,
} from '../controllers/aiController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// POST /api/ai/suggest-priority
router.post(
  '/suggest-priority',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().isString(),
    body('dueDate').optional().isString(),
  ],
  suggestPriority
);

// POST /api/ai/weekly-report
router.post('/weekly-report', generateWeeklyReport);

// POST /api/ai/summary
router.post('/summary', generateSummary);

export default router;
