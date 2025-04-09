import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const part = await prisma.equipmentPart.create({
      data: {
        ...json,
        equipmentId: id,
      },
    });

    return NextResponse.json(part);
  } catch (error) {
    console.error('Failed to create equipment part:', error);
    return new NextResponse(
      JSON.stringify({ error: "部品情報の登録に失敗しました" }),
      { status: 500 }
    );
  }
}