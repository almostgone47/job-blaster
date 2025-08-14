/*
  Warnings:

  - You are about to drop the `Offer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_userId_fkey";

-- DropTable
DROP TABLE "Offer";

-- CreateIndex
CREATE INDEX "Job_userId_salaryMin_salaryMax_idx" ON "Job"("userId", "salaryMin", "salaryMax");

-- CreateIndex
CREATE INDEX "SalaryOffer_userId_jobId_idx" ON "SalaryOffer"("userId", "jobId");
