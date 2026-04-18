import { Router } from 'express';
import { JobController } from '../controllers/JobController';
import { ApplicationController } from '../controllers/ApplicationController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRole } from '../middleware/authorizeRole';
import { UserRole } from '../types/enums';

const router = Router();
const jobController = new JobController();
const appController = new ApplicationController();

// POST /api/jobs — employer posts a job
router.post(
  '/',
  authenticateJWT,
  authorizeRole(UserRole.EMPLOYER),
  (req, res, next) => jobController.postJob(req, res, next),
);

// GET /api/jobs — list open jobs (all authenticated users)
router.get('/', authenticateJWT, (req, res, next) => jobController.listJobs(req, res, next));

// GET /api/jobs/my — employer's own jobs
router.get(
  '/my',
  authenticateJWT,
  authorizeRole(UserRole.EMPLOYER),
  (req, res, next) => jobController.getEmployerJobs(req, res, next),
);

// GET /api/jobs/:id — single job detail
router.get('/:id', authenticateJWT, (req, res, next) => jobController.getJob(req, res, next));

// GET /api/jobs/:jobId/applications — get all applicants for a job
router.get(
  '/:jobId/applications',
  authenticateJWT,
  authorizeRole(UserRole.EMPLOYER),
  (req, res, next) => appController.getJobApplications(req, res, next),
);

// PATCH /api/jobs/:id/assign — employer assigns a worker
router.patch(
  '/:id/assign',
  authenticateJWT,
  authorizeRole(UserRole.EMPLOYER),
  (req, res, next) => jobController.assignWorker(req, res, next),
);

// PATCH /api/jobs/:id/outcome — employer submits work outcome
router.patch(
  '/:id/outcome',
  authenticateJWT,
  authorizeRole(UserRole.EMPLOYER),
  (req, res, next) => jobController.submitOutcome(req, res, next),
);

export default router;
