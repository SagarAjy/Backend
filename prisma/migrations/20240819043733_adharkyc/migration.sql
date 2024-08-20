-- CreateTable
CREATE TABLE "adharkyc" (
    "adhar_Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "customer_id" UUID NOT NULL,
    "data_adhar" JSON NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adharkyc_pkey" PRIMARY KEY ("adhar_Id")
);

-- AddForeignKey
ALTER TABLE "adharkyc" ADD CONSTRAINT "adharkyc_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
