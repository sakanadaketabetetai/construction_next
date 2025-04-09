import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  try {
    // 全ての回覧ルートを取得するように変更
    const routes = await prisma.circulationRoute.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Failed to fetch circulation routes:', error);
    return new NextResponse(
      JSON.stringify({ error: "回覧ルートの取得に失敗しました" }),
      { status: 500 }
    );
  }
}

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
        email: session.user?.email as string,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "ユーザーが見つかりません" }),
        { status: 404 }
      );
    }

    const json = await request.json();
    const { name, description, members } = json;

    const route = await prisma.circulationRoute.create({
      data: {
        name,
        description,
        createdById: user.id,
        members: {
          create: members.map((member: { userId: string }, index: number) => ({
            userId: member.userId,
            order: index + 1,
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(route);
  } catch (error) {
    console.error('Failed to create circulation route:', error);
    return new NextResponse(
      JSON.stringify({ error: "回覧ルートの作成に失敗しました" }),
      { status: 500 }
    );
  }
}