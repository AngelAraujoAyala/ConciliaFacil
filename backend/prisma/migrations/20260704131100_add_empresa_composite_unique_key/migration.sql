-- DropIndex
DROP INDEX "empresas_rfc_key";

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rfc_userId_key" ON "empresas"("rfc", "userId");
