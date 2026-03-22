import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/taskController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// GET /api/tasks
router.get('/', getAllTasks);

// POST /api/tasks
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('priority').isIn([1, 2, 3, 4]).withMessage('Priority must be 1, 2, 3, or 4'),
    body('projectId').optional().isString(),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
  ],
  createTask
);

// PUT /api/tasks/:id
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty'),
    body('priority').optional().isIn([1, 2, 3, 4]).withMessage('Priority must be 1, 2, 3, or 4'),
    body('completed').optional().isBoolean(),
  ],
  updateTask
);

// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

// POST /api/tasks/reorder
router.post('/reorder', reorderTasks);

export default router;
