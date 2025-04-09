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
    const equipment = await prisma.equipment.findMany({
      include: {
        parts: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    return new NextResponse(
      JSON.stringify({ error: "設備情報の取得に失敗しました" }),
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
    const json = await request.json();
    const equipment = await prisma.equipment.create({
      data: json,
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to create equipment:', error);
    return new NextResponse(
      JSON.stringify({ error: "設備情報の登録に失敗しました" }),
      { status: 500 }
    );
  }
}