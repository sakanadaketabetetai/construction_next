-- CreateTable
CREATE TABLE "_ConstructionProjectToEquipment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConstructionProjectToEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ConstructionProjectToEquipment_B_index" ON "_ConstructionProjectToEquipment"("B");

-- AddForeignKey
ALTER TABLE "_ConstructionProjectToEquipment" ADD CONSTRAINT "_ConstructionProjectToEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConstructionProjectToEquipment" ADD CONSTRAINT "_ConstructionProjectToEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
