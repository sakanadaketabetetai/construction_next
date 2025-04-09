import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { date: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  try {
    const { date } = await Promise.resolve(context.params);

    if (!date) {
      return new NextResponse(
        JSON.stringify({ error: "日付が指定されていません" }),
        { status: 400 }
      );
    }

    // 日誌を取得（全ユーザーの日誌を取得可能に）
    const dailyLog = await prisma.dailyLog.findFirst({
      where: {
        date: new Date(date),
      },
      include: {
        entries: {
          include: {
            constructionProject: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        circulations: {
          include: {
            approver: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!dailyLog) {
      // 継続中の工事を取得
      const ongoingProjects = await prisma.constructionProject.findMany({
        where: {
          status: 'ONGOING',
        },
        select: {
          id: true,
          title: true,
        },
      });

      return NextResponse.json({
        exists: false,
        ongoingProjects,
      });
    }

    return NextResponse.json({
      exists: true,
      dailyLog,
    });
  } catch (error) {
    console.error('Failed to fetch daily log:', error);
    return new NextResponse(
      JSON.stringify({ error: "業務日誌の取得に失敗しました" }),
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { date: string } }
) {
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
        email: session.user?.email as string,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "ユーザーが見つかりません" }),
        { status: 404 }
      );
    }

    const { date } = await Promise.resolve(context.params);
    const json = await request.json();

    const dailyLog = await prisma.dailyLog.create({
      data: {
        date: new Date(date),
        nextWorkDate: new Date(json.nextWorkDate),
        isHoliday: json.isHoliday,
        status: 'DRAFT',
        createdById: user.id,
        entries: {
          create: json.entries.map((entry: any) => ({
            constructionProjectId: entry.constructionProjectId,
            workStatus: entry.workStatus,
            workDescription: entry.workDescription,
            nextWorkPlan: entry.nextWorkPlan,
          })),
        },
      },
      include: {
        entries: {
          include: {
            constructionProject: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        circulations: {
          include: {
            approver: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(dailyLog);
  } catch (error) {
    console.error('Failed to create daily log:', error);
    return new NextResponse(
      JSON.stringify({ error: "業務日誌の作成に失敗しました" }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { date: string } }
) {
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
        email: session.user?.email as string,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "ユーザーが見つかりません" }),
        { status: 404 }
      );
    }

    const { date } = await Promise.resolve(context.params);
    const json = await request.json();

    // 既存の日誌を取得
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        date: new Date(date),
        createdById: user.id,
      },
    });

    if (!existingLog) {
      return new NextResponse(
        JSON.stringify({ error: "業務日誌が見つかりません" }),
        { status: 404 }
      );
    }

    // ステータスが DRAFT 以外の場合は更新を許可しない
    if (existingLog.status !== 'DRAFT') {
      return new NextResponse(
        JSON.stringify({ error: "この業務日誌は編集できません" }),
        { status: 400 }
      );
    }

    // 既存のエントリーを削除
    await prisma.dailyLogEntry.deleteMany({
      where: {
        dailyLogId: existingLog.id,
      },
    });

    // 日誌を更新
    const updatedLog = await prisma.dailyLog.update({
      where: {
        id: existingLog.id,
      },
      data: {
        nextWorkDate: new Date(json.nextWorkDate),
        isHoliday: json.isHoliday,
        entries: {
          create: json.entries.map((entry: any) => ({
            constructionProjectId: entry.constructionProjectId,
            workStatus: entry.workStatus,
            workDescription: entry.workDescription,
            nextWorkPlan: entry.nextWorkPlan,
          })),
        },
      },
      include: {
        entries: {
          include: {
            constructionProject: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        circulations: {
          include: {
            approver: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Failed to update daily log:', error);
    return new NextResponse(
      JSON.stringify({ error: "業務日誌の更新に失敗しました" }),
      { status: 500 }
    );
  }
}