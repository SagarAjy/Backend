/*
  Warnings:

  - A unique constraint covering the columns `[client_id]` on the table `aadharkyc` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "aadharkyc_client_id_key" ON "aadharkyc"("client_id");
