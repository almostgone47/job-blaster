/*
  Warnings:

  - You are about to drop the column `isRemote` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `locationCity` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `locationCountry` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `locationState` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `postedAt` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "isRemote",
DROP COLUMN "locationCity",
DROP COLUMN "locationCountry",
DROP COLUMN "locationState",
DROP COLUMN "postedAt",
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "salary" TEXT,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'SAVED',
ADD COLUMN     "tags" TEXT[];
