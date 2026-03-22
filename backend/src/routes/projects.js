import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// GET /api/projects
router.get('/', getAllProjects);

// POST /api/projects
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('color').optional().isString(),
    body('emoji').optional().isString(),
  ],
  createProject
);

// PUT /api/projects/:id
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
    body('color').optional().isString(),
    body('emoji').optional().isString(),
  ],
  updateProject
);

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);

export default router;
