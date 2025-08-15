-- CreateTable
CREATE TABLE "CompanyResearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "insights" TEXT NOT NULL,
    "rating" INTEGER,
    "pros" TEXT[],
    "cons" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyResearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyResearch_userId_companyName_idx" ON "CompanyResearch"("userId", "companyName");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyResearch_userId_companyName_key" ON "CompanyResearch"("userId", "companyName");

-- AddForeignKey
ALTER TABLE "CompanyResearch" ADD CONSTRAINT "CompanyResearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
