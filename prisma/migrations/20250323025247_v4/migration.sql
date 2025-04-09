/*
  Warnings:

  - You are about to drop the column `month` on the `daily_logs` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `daily_logs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,createdById]` on the table `daily_logs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nextWorkPlan` to the `daily_log_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextWorkDate` to the `daily_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "daily_log_entries" ADD COLUMN     "nextWorkPlan" TEXT NOT NULL,
ADD COLUMN     "workStatus" "WorkStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "daily_logs" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "isHoliday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextWorkDate" DATE NOT NULL,
ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_date_createdById_key" ON "daily_logs"("date", "createdById");
