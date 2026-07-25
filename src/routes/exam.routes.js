const express = require('express');

const {
  importExamFromApiIa,
  listImportedExamsFromApiIa,
  createExam,
  listExams,
  listUpcomingExams,
  getExamById,
  updateExam,
  deleteExam,
} = require('../controllers/exam.controller');

const router = express.Router();

router.post('/import/api-ia/:assessmentId', importExamFromApiIa);
router.get('/import/api-ia', listImportedExamsFromApiIa);

router.post('/', createExam);

router.get('/', listExams);

// IMPORTANTE: deve vir antes de "/:id"
router.get('/upcoming', listUpcomingExams);

router.get('/:id', getExamById);

router.put('/:id', updateExam);

router.delete('/:id', deleteExam);

module.exports = router;
