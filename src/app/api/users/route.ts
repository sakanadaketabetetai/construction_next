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
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return new NextResponse(
      JSON.stringify({ error: "ユーザー情報の取得に失敗しました" }),
      { status: 500 }
    );
  }
}