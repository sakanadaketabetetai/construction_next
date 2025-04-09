import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReportDetail from '@/components/construction/id/report/id/report-detail';;

async function getConstructionReport(projectId: string, reportId: string) {
  const report = await prisma.constructionReport.findUnique({
    where: { 
      id: reportId,
      constructionProjectId: projectId,
    },
    include: {
      constructionProject: {
        select: {
          title: true,
        },
      },
      createdBy: {
        select: {
          email: true,
          fullName: true,
        },
      },
      inspectionResults: {
        include: {
          equipment: {
            select: {
              name: true,
            },
          },
          measurements: {
            select: {
              id: true,
              value: true,
              measuredAt: true,
              measurementField: {
                select: {
                  name: true,
                  type: true,
                  unit: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  return report;
}

export default async function ReportDetailPage({
  params,
}: {
  params: { id: string; reportId: string };
}) {
  const report = await getConstructionReport(params.id, params.reportId);

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">読み込み中...</div>}>
      <ReportDetail report={report} projectId={params.id} />
    </Suspense>
  );
}