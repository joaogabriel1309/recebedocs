-- CreateEnum
CREATE TYPE "StatusAnalise" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'REVISAO_MANUAL');

-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "motivoAnalise" TEXT,
ADD COLUMN     "statusAnalise" "StatusAnalise" NOT NULL DEFAULT 'PENDENTE';
