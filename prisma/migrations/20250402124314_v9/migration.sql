/*
  Warnings:

  - Added the required column `inspectionResultId` to the `measurements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "construction_reports" DROP CONSTRAINT "construction_reports_constructionProjectId_fkey";

-- DropForeignKey
ALTER TABLE "inspection_results" DROP CONSTRAINT "inspection_results_reportId_fkey";

-- AlterTable
ALTER TABLE "construction_reports" ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "measurements" ADD COLUMN     "inspectionResultId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "construction_reports" ADD CONSTRAINT "construction_reports_constructionProjectId_fkey" FOREIGN KEY ("constructionProjectId") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_reports" ADD CONSTRAINT "construction_reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "inspection_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_results" ADD CONSTRAINT "inspection_results_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "construction_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_inspectionResultId_fkey" FOREIGN KEY ("inspectionResultId") REFERENCES "inspection_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
