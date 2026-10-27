-- CreateTable
CREATE TABLE "Documento" (
    "id" UUID NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Documento_key_key" ON "Documento"("key");
