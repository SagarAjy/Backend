/*
  Warnings:

  - You are about to drop the `adharkyc` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "adharkyc" DROP CONSTRAINT "adharkyc_customer_id_fkey";

-- DropTable
DROP TABLE "adharkyc";

-- CreateTable
CREATE TABLE "aadharkyc" (
    "aadhar_Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "customer_id" UUID NOT NULL,
    "data_aadhar" JSON NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aadharkyc_pkey" PRIMARY KEY ("aadhar_Id")
);

-- AddForeignKey
ALTER TABLE "aadharkyc" ADD CONSTRAINT "aadharkyc_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
