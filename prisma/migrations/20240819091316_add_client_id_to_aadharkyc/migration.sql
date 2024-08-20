/*
  Warnings:

  - Added the required column `client_id` to the `aadharkyc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "aadharkyc" ADD COLUMN     "client_id" TEXT NOT NULL;
