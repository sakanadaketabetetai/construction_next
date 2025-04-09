import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { yearMonth: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  try {
    const params = context.params;
    const { yearMonth } = await params;

    if (!yearMonth) {
      return new NextResponse(
        JSON.stringify({ error: "年月が指定されていません" }),
        { status: 400 }
      );
    }

    const [year, month] = yearMonth.split('-').map(Number);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return new NextResponse(
        JSON.stringify({ error: "無効な年月形式です" }),
        { status: 400 }
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 全ユーザーの日誌を取得
    const dailyLogs = await prisma.dailyLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        createdBy: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(dailyLogs);
  } catch (error) {
    console.error('Failed to fetch daily logs:', error);
    return new NextResponse(
      JSON.stringify({ error: "業務日誌の取得に失敗しました" }),
      { status: 500 }
    );
  }
}