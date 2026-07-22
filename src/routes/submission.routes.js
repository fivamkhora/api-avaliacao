const express = require('express');
const submissionController = require('../controllers/submission.controller');

const router = express.Router();

router.post('/', submissionController.createSubmission);

router.get('/', submissionController.listSubmissions);

router.get('/:id', submissionController.getSubmissionById);

router.put('/:id', submissionController.updateSubmission);

router.delete('/:id', submissionController.deleteSubmission);

module.exports = router;