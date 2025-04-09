-- AlterTable
ALTER TABLE "measurement_fields" ADD COLUMN     "interval" INTEGER;

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "measurementFieldId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_measurementFieldId_fkey" FOREIGN KEY ("measurementFieldId") REFERENCES "measurement_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
