const express = require('express');
const submissionController = require('../controllers/submission.controller');

const router = express.Router();

router.post('/', submissionController.createSubmission);

router.post(
  '/:submissionId/submit',
  submissionController.submitSubmission,
);

router.get('/', submissionController.listSubmissions);

router.get(
  '/:submissionId/result',
  submissionController.getSubmissionResult,
);

router.get('/:id', submissionController.getSubmissionById);

router.put('/:id', submissionController.updateSubmission);

router.delete('/:id', submissionController.deleteSubmission);

module.exports = router;
