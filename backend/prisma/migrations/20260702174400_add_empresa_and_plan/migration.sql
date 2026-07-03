-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'BASIC', 'PRO');

-- AlterTable: Add plan column to users
ALTER TABLE "users" ADD COLUMN "plan" "UserPlan" NOT NULL DEFAULT 'FREE';

-- AlterTable: Add empresas relation columns
ALTER TABLE "conciliations"
  ADD COLUMN "rfcEmpresa" TEXT,
  ADD COLUMN "empresaId" TEXT;

-- CreateTable: Empresa
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rfc_key" ON "empresas"("rfc");

-- CreateIndex
CREATE INDEX "empresas_userId_idx" ON "empresas"("userId");

-- CreateIndex
CREATE INDEX "conciliations_empresaId_idx" ON "conciliations"("empresaId");

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conciliations" ADD CONSTRAINT "conciliations_empresaId_fkey"
  FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
