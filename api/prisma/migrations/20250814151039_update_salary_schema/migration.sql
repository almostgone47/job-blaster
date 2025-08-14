/*
  Warnings:

  - You are about to drop the column `deadline` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `faviconUrl` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `lastActivityAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salaryCurrency` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salaryMax` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salaryMin` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salaryType` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `SalaryHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaryOffer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SalaryHistory" DROP CONSTRAINT "SalaryHistory_jobId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryHistory" DROP CONSTRAINT "SalaryHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryOffer" DROP CONSTRAINT "SalaryOffer_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryOffer" DROP CONSTRAINT "SalaryOffer_jobId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryOffer" DROP CONSTRAINT "SalaryOffer_userId_fkey";

-- DropIndex
DROP INDEX "Job_userId_deadline_idx";

-- DropIndex
DROP INDEX "Job_userId_lastActivityAt_idx";

-- DropIndex
DROP INDEX "Job_userId_salaryMax_idx";

-- DropIndex
DROP INDEX "Job_userId_salaryMin_idx";

-- DropIndex
DROP INDEX "Job_userId_status_createdAt_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "deadline",
DROP COLUMN "faviconUrl",
DROP COLUMN "lastActivityAt",
DROP COLUMN "location",
DROP COLUMN "notes",
DROP COLUMN "salary",
DROP COLUMN "salaryCurrency",
DROP COLUMN "salaryMax",
DROP COLUMN "salaryMin",
DROP COLUMN "salaryType",
DROP COLUMN "status",
DROP COLUMN "tags",
ADD COLUMN     "isRemote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "locationCountry" TEXT,
ADD COLUMN     "locationState" TEXT,
ADD COLUMN     "postedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "SalaryHistory";

-- DropTable
DROP TABLE "SalaryOffer";

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "baseMin" INTEGER,
    "baseMax" INTEGER,
    "baseExact" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "employmentType" TEXT NOT NULL DEFAULT 'full_time',
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationCountry" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "benefitsJson" JSONB,
    "offerDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'listed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_userId_status_idx" ON "Offer"("userId", "status");

-- CreateIndex
CREATE INDEX "Offer_userId_offerDate_idx" ON "Offer"("userId", "offerDate");

-- CreateIndex
CREATE INDEX "Offer_userId_idx" ON "Offer"("userId");

-- CreateIndex
CREATE INDEX "Offer_jobId_idx" ON "Offer"("jobId");

-- CreateIndex
CREATE INDEX "Job_userId_idx" ON "Job"("userId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
