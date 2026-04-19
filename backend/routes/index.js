const express = require('express');
const multer = require('multer');
const router = express.Router();

const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const AuthController = require('../controllers/AuthController');
const WorkerController = require('../controllers/WorkerController');
const EmployerController = require('../controllers/EmployerController');
const JobController = require('../controllers/JobController');
const ApplicationController = require('../controllers/ApplicationController');
const DisputeController = require('../controllers/DisputeController');
const AdminController = require('../controllers/AdminController');
const VerificationService = require('../services/VerificationService');

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Auth
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/otp/send', AuthController.sendOtp);
router.post('/auth/otp/verify', AuthController.login); // Simulated together with login for now

// Workers
// POST /api/workers is implicitly handled by /register when role=WORKER, but if needed explicitly:
// router.post('/workers', authenticateJWT, authorizeRole('WORKER'), WorkerController.createProfile);
router.post('/workers/verify', authenticateJWT, authorizeRole('WORKER'), upload.single('document'), async (req, res, next) => {
  try {
    const { doc_type } = req.body;
    const workerId = req.user.id; // needs mapping User ID -> Worker ID, assuming req.user has Worker relation or we look it up.
    // For simplicity, let's assume auth middleware doesn't attach the Worker ID, so VerificationService handles mapping or we map here.
    const { Worker } = require('../models');
    const worker = await Worker.findOne({ where: { user_id: req.user.id } });
    if (!worker) return res.status(403).json({ error: 'Worker profile missing' });
    
    const verification = await VerificationService.submitVerification(worker.id, doc_type, req.file ? req.file.path : '');
    res.json(verification);
  } catch (e) {
    next(e);
  }
});
router.get('/workers/:id/profile', authenticateJWT, WorkerController.getProfile);
router.get('/workers/:id/score', authenticateJWT, WorkerController.getScoreHistory);

// Employers
router.get('/employers/profile', authenticateJWT, authorizeRole('EMPLOYER'), EmployerController.getProfile);

// Jobs
router.post('/jobs', authenticateJWT, authorizeRole('EMPLOYER'), JobController.createJob);
router.get('/jobs', JobController.listJobs);
router.patch('/jobs/:id/assign', authenticateJWT, authorizeRole('EMPLOYER'), JobController.assignWorker);
router.patch('/jobs/:id/outcome', authenticateJWT, authorizeRole('EMPLOYER'), JobController.submitOutcome);

// Applications
router.post('/applications', authenticateJWT, authorizeRole('WORKER'), ApplicationController.applyForJob);
router.get('/applications/:id', authenticateJWT, ApplicationController.getApplication);

// Disputes
router.post('/disputes', authenticateJWT, DisputeController.raiseDispute);
router.patch('/disputes/:id/resolve', authenticateJWT, authorizeRole('ADMIN'), DisputeController.resolveDispute);

// Admin
router.get('/admin/verifications', authenticateJWT, authorizeRole('ADMIN'), AdminController.listVerifications);
router.patch('/admin/verifications/:id', authenticateJWT, authorizeRole('ADMIN'), AdminController.resolveVerification);

module.exports = router;
