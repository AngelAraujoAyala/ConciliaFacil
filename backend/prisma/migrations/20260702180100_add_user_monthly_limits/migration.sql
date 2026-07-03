-- Add monthly usage tracking
ALTER TABLE "users"
ADD COLUMN "monthlyConciliations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "nextResetDate" TIMESTAMP NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month');
