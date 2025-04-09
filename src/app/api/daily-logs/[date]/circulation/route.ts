import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { date } = await Promise.resolve(context.params);
    const json = await request.json();
    const { routeId } = json;

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

    // 日誌を取得
    const dailyLog = await prisma.dailyLog.findFirst({
      where: {
        date: new Date(date),
        createdById: user.id,
      },
    });

    if (!dailyLog) {
      return new NextResponse(
        JSON.stringify({ error: "業務日誌が見つかりません" }),
        { status: 404 }
      );
    }

    // 回覧ルートのメンバーを取得
    const routeMembers = await prisma.circulationRouteMember.findMany({
      where: {
        routeId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    if (routeMembers.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "回覧ルートにメンバーが設定されていません" }),
        { status: 400 }
      );
    }

    // 回覧を作成
    const circulations = await prisma.$transaction(
      routeMembers.map((member) =>
        prisma.circulation.create({
          data: {
            dailyLogId: dailyLog.id,
            approverId: member.userId,
            createdById: user.id,
          },
        })
      )
    );

    // 日誌のステータスを更新
    await prisma.dailyLog.update({
      where: {
        id: dailyLog.id,
      },
      data: {
        status: 'IN_REVIEW',
      },
    });

    return NextResponse.json(circulations);
  } catch (error) {
    console.error('Failed to start circulation:', error);
    return new NextResponse(
      JSON.stringify({ error: "回覧の開始に失敗しました" }),
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
    const json = await request.json();
    const { status, comment } = json;

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

    // 承認対象の回覧を取得
    const circulation = await prisma.circulation.findFirst({
      where: {
        dailyLog: {
          date: new Date(date),
        },
        approverId: user.id,
        status: 'PENDING',
      },
      include: {
        dailyLog: true,
      },
    });

    if (!circulation) {
      return new NextResponse(
        JSON.stringify({ error: "承認対象の回覧が見つかりません" }),
        { status: 404 }
      );
    }

    // 回覧を更新
    const updatedCirculation = await prisma.circulation.update({
      where: {
        id: circulation.id,
      },
      data: {
        status,
        comment,
      },
    });

    // 全ての回覧が承認された場合、日誌のステータスを更新
    if (status === 'APPROVED') {
      const pendingCirculations = await prisma.circulation.count({
        where: {
          dailyLogId: circulation.dailyLogId,
          status: 'PENDING',
        },
      });

      if (pendingCirculations === 0) {
        await prisma.dailyLog.update({
          where: {
            id: circulation.dailyLogId,
          },
          data: {
            status: 'APPROVED',
          },
        });
      }
    }

    return NextResponse.json(updatedCirculation);
  } catch (error) {
    console.error('Failed to update circulation:', error);
    return new NextResponse(
      JSON.stringify({ error: "回覧の更新に失敗しました" }),
      { status: 500 }
    );
  }
}