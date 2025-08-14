-- DropIndex
DROP INDEX "Job_userId_idx";

-- DropIndex
DROP INDEX "Offer_jobId_idx";

-- DropIndex
DROP INDEX "Offer_userId_idx";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "isRemote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "locationCountry" TEXT,
ADD COLUMN     "locationState" TEXT,
ADD COLUMN     "postedAt" TIMESTAMP(3),
ADD COLUMN     "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "salaryMax" INTEGER,
ADD COLUMN     "salaryMin" INTEGER,
ADD COLUMN     "salaryType" "SalaryType" NOT NULL DEFAULT 'ANNUAL';

-- CreateTable
CREATE TABLE "SalaryOffer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicationId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" "SalaryType" NOT NULL DEFAULT 'ANNUAL',
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "offeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "benefits" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" "SalaryType" NOT NULL DEFAULT 'ANNUAL',
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalaryOffer_userId_status_idx" ON "SalaryOffer"("userId", "status");

-- CreateIndex
CREATE INDEX "SalaryOffer_userId_offeredAt_idx" ON "SalaryOffer"("userId", "offeredAt");

-- CreateIndex
CREATE INDEX "SalaryOffer_jobId_idx" ON "SalaryOffer"("jobId");

-- CreateIndex
CREATE INDEX "SalaryHistory_userId_effectiveDate_idx" ON "SalaryHistory"("userId", "effectiveDate");

-- CreateIndex
CREATE INDEX "SalaryHistory_jobId_idx" ON "SalaryHistory"("jobId");

-- CreateIndex
CREATE INDEX "Job_userId_status_createdAt_idx" ON "Job"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_userId_lastActivityAt_idx" ON "Job"("userId", "lastActivityAt");

-- CreateIndex
CREATE INDEX "Job_userId_deadline_idx" ON "Job"("userId", "deadline");

-- CreateIndex
CREATE INDEX "Job_userId_salaryMin_idx" ON "Job"("userId", "salaryMin");

-- CreateIndex
CREATE INDEX "Job_userId_salaryMax_idx" ON "Job"("userId", "salaryMax");

-- CreateIndex
CREATE INDEX "Job_userId_locationCity_idx" ON "Job"("userId", "locationCity");

-- CreateIndex
CREATE INDEX "Job_userId_locationState_idx" ON "Job"("userId", "locationState");

-- CreateIndex
CREATE INDEX "Job_userId_isRemote_idx" ON "Job"("userId", "isRemote");

-- AddForeignKey
ALTER TABLE "SalaryOffer" ADD CONSTRAINT "SalaryOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryOffer" ADD CONSTRAINT "SalaryOffer_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryOffer" ADD CONSTRAINT "SalaryOffer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryHistory" ADD CONSTRAINT "SalaryHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryHistory" ADD CONSTRAINT "SalaryHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
