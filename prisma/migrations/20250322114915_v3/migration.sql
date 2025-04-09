-- CreateTable
CREATE TABLE "construction_reports" (
    "id" TEXT NOT NULL,
    "constructionProjectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_results" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "issues" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "construction_reports" ADD CONSTRAINT "construction_reports_constructionProjectId_fkey" FOREIGN KEY ("constructionProjectId") REFERENCES "construction_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_reports" ADD CONSTRAINT "construction_reports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_results" ADD CONSTRAINT "inspection_results_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "construction_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_results" ADD CONSTRAINT "inspection_results_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
