-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('NUMBER', 'TEMPERATURE', 'PRESSURE', 'CURRENT', 'VOLTAGE', 'FLOW_RATE');

-- CreateTable
CREATE TABLE "measurement_fields" (
    "id" TEXT NOT NULL,
    "templateItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MeasurementType" NOT NULL,
    "unit" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurement_fields_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "measurement_fields" ADD CONSTRAINT "measurement_fields_templateItemId_fkey" FOREIGN KEY ("templateItemId") REFERENCES "inspection_template_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
