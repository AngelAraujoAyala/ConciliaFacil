/*
  Warnings:

  - Added the required column `remainingBankMovements` to the `conciliations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "conciliations" ADD COLUMN     "matchedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "remainingBankMovements" JSONB NOT NULL,
ADD COLUMN     "totalBankMovements" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalInvoices" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "conciliations_userId_idx" ON "conciliations"("userId");
