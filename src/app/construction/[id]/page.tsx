import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ConstructionDetail from '@/components/construction/id/construction-detail';

async function getConstructionProject(id: string) {
  const project = await prisma.constructionProject.findUnique({
    where: { id },
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
        },
      },
      reports: {
        include: {
          createdBy: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return project;
}

export default async function ConstructionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const project = await getConstructionProject(id);

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">読み込み中...</div>}>
      <ConstructionDetail project={project} />
    </Suspense>
  );
}