import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EquipmentDetail from '@/components/equipment/id/equipment-detail';

async function getEquipment(id: string) {
  const equipmentId = await id;
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      parts: true,
      inspections: {
        include: {
          inspector: true,
        },
        orderBy: {
          inspectionDate: 'desc',
        },
      },
      constructionProjects: {
        include: {
          reports: {
            include: {
              inspectionResults: {
                where: {
                  equipmentId: id,
                },
              },
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      },
      inspectionResults: {
        include: {
          report: {
            include: {
              constructionProject: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!equipment) {
    notFound();
  }

  return {
    ...equipment,
    parts: equipment.parts.map((part) => ({
      ...part,
      lastOrderedPrice: part.lastOrderedPrice ? Number(part.lastOrderedPrice) : null,
    })),
  };
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const equipment = await getEquipment(params.id);

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">読み込み中...</div>}>
      <EquipmentDetail equipment={equipment} />
    </Suspense>
  );
}