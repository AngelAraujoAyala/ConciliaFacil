-- AlterTable
ALTER TABLE "conciliations" ADD COLUMN     "invoices" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "movements" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "schemaVersion" INTEGER NOT NULL DEFAULT 2;

-- CreateIndex
CREATE INDEX "conciliations_schemaVersion_idx" ON "conciliations"("schemaVersion");
