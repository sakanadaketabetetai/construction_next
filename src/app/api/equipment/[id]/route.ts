import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  const { id } = context.params;

  try {
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
      },
    });

    if (!equipment) {
      return new NextResponse(
        JSON.stringify({ error: "設備が見つかりません" }),
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    return new NextResponse(
      JSON.stringify({ error: "設備情報の取得に失敗しました" }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  const { id } = context.params;
  const json = await request.json();

  try {
    const equipment = await prisma.equipment.update({
      where: { id },
      data: json,
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to update equipment:', error);
    return new NextResponse(
      JSON.stringify({ error: "設備情報の更新に失敗しました" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401 }
    );
  }

  const { id } = context.params;

  try {
    await prisma.equipment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return new NextResponse(
      JSON.stringify({ error: "設備の削除に失敗しました" }),
      { status: 500 }
    );
  }
}