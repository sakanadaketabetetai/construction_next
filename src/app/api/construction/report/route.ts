import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string
      }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "ユーザーが見つかりません" }),
        { status: 404 }
      );
    }

    const json = await request.json();
    const { constructionProjectId, content, topics, templateId, inspectionResults } = json;

    // トランザクションで工事報告書と点検結果、計測値を一括登録
    const report = await prisma.$transaction(async (tx) => {
      // 工事報告書を作成
      const report = await tx.constructionReport.create({
        data: {
          constructionProjectId,
          content,
          topics,
          createdById: user.id,
          templateId,
        },
      });

      // 点検結果と計測値を登録
      for (const result of inspectionResults) {
        const inspectionResult = await tx.inspectionResult.create({
          data: {
            reportId: report.id,
            equipmentId: result.equipmentId,
            result: result.result,
            issues: result.issues,
          },
        });

        // 計測値を登録
        for (const measurement of result.measurements) {
          await tx.measurement.create({
            data: {
              measurementFieldId: measurement.fieldId,
              value: measurement.value,
              measuredAt: new Date(measurement.measuredAt),
              inspectionResultId: inspectionResult.id,
            },
          });
        }
      }

      return report;
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to create construction report:', error);
    return new NextResponse(
      JSON.stringify({ error: "工事報告書の登録に失敗しました" }),
      { status: 500 }
    );
  }
}