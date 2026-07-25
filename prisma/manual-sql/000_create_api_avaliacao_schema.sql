-- Creates the complete API Avaliacao schema in an empty PostgreSQL database.
-- Includes the API-IA import fields: externalAssessmentId, aiVersion, and rubric.

BEGIN;

CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'CORRECTED');
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY');
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'CORRECTED');

CREATE TABLE "exams" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "classroomId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "externalAssessmentId" TEXT,
  "aiVersion" INTEGER,
  "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
  "availableAt" TIMESTAMP(3),
  "deadlineAt" TIMESTAMP(3),
  "timeLimit" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "questions" (
  "id" TEXT NOT NULL,
  "examId" TEXT NOT NULL,
  "statement" TEXT NOT NULL,
  "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
  "options" JSONB,
  "correctAnswer" TEXT,
  "rubric" TEXT,
  "points" DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
  "position" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exam_submissions" (
  "id" TEXT NOT NULL,
  "examId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "startedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "score" DECIMAL(10, 2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "exam_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "answers" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "content" TEXT,
  "selectedOption" TEXT,
  "isCorrect" BOOLEAN,
  "score" DECIMAL(10, 2),
  "feedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "exams_classroomId_idx" ON "exams"("classroomId");
CREATE INDEX "exams_teacherId_idx" ON "exams"("teacherId");
CREATE INDEX "exams_status_idx" ON "exams"("status");
CREATE INDEX "exams_availableAt_idx" ON "exams"("availableAt");
CREATE UNIQUE INDEX "exams_externalAssessmentId_key" ON "exams"("externalAssessmentId");

CREATE INDEX "questions_examId_idx" ON "questions"("examId");
CREATE UNIQUE INDEX "questions_examId_position_key" ON "questions"("examId", "position");

CREATE INDEX "exam_submissions_studentId_idx" ON "exam_submissions"("studentId");
CREATE INDEX "exam_submissions_status_idx" ON "exam_submissions"("status");
CREATE UNIQUE INDEX "exam_submissions_examId_studentId_key"
  ON "exam_submissions"("examId", "studentId");

CREATE INDEX "answers_questionId_idx" ON "answers"("questionId");
CREATE UNIQUE INDEX "answers_submissionId_questionId_key"
  ON "answers"("submissionId", "questionId");

ALTER TABLE "questions"
  ADD CONSTRAINT "questions_examId_fkey"
  FOREIGN KEY ("examId") REFERENCES "exams"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "exam_submissions"
  ADD CONSTRAINT "exam_submissions_examId_fkey"
  FOREIGN KEY ("examId") REFERENCES "exams"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "answers"
  ADD CONSTRAINT "answers_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "exam_submissions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "answers"
  ADD CONSTRAINT "answers_questionId_fkey"
  FOREIGN KEY ("questionId") REFERENCES "questions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
