ALTER TABLE "exams"
ADD COLUMN "externalAssessmentId" TEXT,
ADD COLUMN "aiVersion" INTEGER;

CREATE UNIQUE INDEX "exams_externalAssessmentId_key"
ON "exams"("externalAssessmentId");

ALTER TABLE "questions"
ADD COLUMN "rubric" TEXT;
